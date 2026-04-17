import mongoose from 'mongoose';
import Voucher from '../src/database/models/Voucher';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const VOUCHER_COUNT = 20;
const DISCOUNT_AMOUNT = 250; // #250 discount on registration (registration is #2000, so final price is #1750)
const VOUCHER_TYPE = 'REGISTRATION';
const EXPIRY_DAYS = 30; // Valid for 30 days

async function generateVouchers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://ajibarebabajide1_db_user:<db_password>@creative.2xkavxl.mongodb.net/?appName=Creative';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const generatedVouchers: Array<{ code: string; discount: number; expiryDate: Date }> = [];

    console.log(`\nGenerating ${VOUCHER_COUNT} voucher codes...\n`);

    for (let i = 0; i < VOUCHER_COUNT; i++) {
      // Generate unique 6-digit code
      const code = Voucher.generateCode();
      
      // Check if code already exists
      const existing = await Voucher.findByCode(code);
      if (existing) {
        i--; // Try again
        continue;
      }

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

      // Create voucher
      const voucher = new Voucher({
        code,
        discount: DISCOUNT_AMOUNT,
        type: VOUCHER_TYPE,
        isActive: true,
        expiresAt,
      });

      await voucher.save();

      generatedVouchers.push({
        code: voucher.code,
        discount: voucher.discount,
        expiryDate: voucher.expiresAt,
      });

      console.log(`✓ Voucher ${i + 1}: ${code} (₦${DISCOUNT_AMOUNT} off)`);
    }

    console.log(`\n✅ Successfully generated ${VOUCHER_COUNT} voucher codes!`);
    console.log(`\n📋 VOUCHER CODES SUMMARY:`);
    console.log('========================================');
    console.log('Code       | Discount  | Expiry Date');
    console.log('========================================');
    
    generatedVouchers.forEach((v) => {
      const expiryStr = v.expiryDate.toISOString().split('T')[0];
      console.log(`${v.code}    | ₦${v.discount}     | ${expiryStr}`);
    });
    
    console.log('========================================');
    console.log(`\n💡 Each voucher gives ₦${DISCOUNT_AMOUNT} off registration`);
    console.log(`💰 Original price: ₦2000`);
    console.log(`💰 Discounted price: ₦${2000 - DISCOUNT_AMOUNT}`);
    console.log(`\n⏰ Vouchers expire in ${EXPIRY_DAYS} days`);
    console.log(`\n📧 You can now share these codes with users!`);

  } catch (error) {
    console.error('Error generating vouchers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
generateVouchers();
