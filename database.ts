import { PrismaClient } from '@prisma/client';

// Handle BigInt serialization so Express res.json() doesn't crash sending BigInt IDs
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const prisma = new PrismaClient();

export async function createUser(user: any) {
  const newUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
      fieldType: user.fieldType,
      landArea: user.landArea,
      profilePic: user.profilePic || null
    }
  });
  return newUser.id;
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  return user;
}

export async function updateUser(email: string, updates: any) {
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      name: updates.name,
      phone: updates.phone,
      fieldType: updates.fieldType,
      landArea: updates.landArea,
      ...(updates.profilePic !== undefined && { profilePic: updates.profilePic })
    }
  });
  return updatedUser;
}
