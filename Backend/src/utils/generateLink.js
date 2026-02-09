import { v4 as uuidv4 } from 'uuid';

const generateUniqueLink = () => {
  // Generate a short unique identifier for chat links
  const uuid = uuidv4();
  return uuid.split('-')[0] + uuid.split('-')[1];
};

export default generateUniqueLink;
