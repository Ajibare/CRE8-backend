import User from '../database/models/User';

export const generateBusinessId = async (): Promise<string> => {
  const prefix = 'BUS';

  // Find the highest business ID with BUS prefix
  const lastUser = await User.findOne({
    creativeId: { $regex: `^${prefix}\d{6}$` }
  }).sort({ creativeId: -1 });

  let sequenceNumber = 1;

  if (lastUser && lastUser.creativeId) {
    // Extract the sequence number from the last ID (e.g., BUS000123 -> 123)
    const lastSequence = parseInt(lastUser.creativeId.substring(3));
    sequenceNumber = lastSequence + 1;
  }

  // Format with leading zeros (6 digits)
  const paddedSequence = sequenceNumber.toString().padStart(6, '0');

  return `${prefix}${paddedSequence}`;
};
