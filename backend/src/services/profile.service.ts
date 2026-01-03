import prisma from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { Role } from '../types';
import cloudinary from '../config/cloudinary';

export class ProfileService {
    /**
     * Get user profile
     */
    async getProfile(userId: string, requestingUserId: string, requestingUserRole: Role) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                employee: {
                    include: {
                        manager: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Check permissions: employees can only view their own profile
        if (requestingUserRole === Role.EMPLOYEE && userId !== requestingUserId) {
            throw new ForbiddenError('You can only view your own profile');
        }

        const employee = user.employee;

        return {
            personal: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: employee?.phone,
                profilePic: user.profilePicUrl,
                dateOfBirth: employee?.dateOfBirth,
                gender: employee?.gender,
                maritalStatus: employee?.maritalStatus,
                nationality: employee?.nationality,
                address: employee?.address,
            },
            professional: {
                employeeCode: employee?.employeeCode,
                loginId: user.loginId,
                company: employee?.company,
                department: employee?.department,
                jobPosition: employee?.jobPosition,
                manager: employee?.manager ? {
                    id: employee.manager.userId,
                    name: `${employee.manager.user.firstName} ${employee.manager.user.lastName}`,
                    email: employee.manager.user.email,
                } : null,
                location: employee?.location,
                dateOfJoining: employee?.dateOfJoining,
                workSchedule: {
                    workingDays: employee?.workingDays,
                    dailyHours: employee?.dailyHours,
                    breakTime: employee?.breakTime,
                },
            },
            bank: {
                accountNumber: employee?.accountNumber,
                bankName: employee?.bankName,
                ifscCode: employee?.ifscCode,
                panNumber: employee?.panNumber,
                uanNumber: employee?.uanNumber,
            },
        };
    }

    /**
     * Update user profile
     */
    async updateProfile(
        userId: string,
        requestingUserId: string,
        requestingUserRole: Role,
        data: any
    ) {
        // Check permissions
        if (requestingUserRole === Role.EMPLOYEE && userId !== requestingUserId) {
            throw new ForbiddenError('You can only update your own profile');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { employee: true },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Define allowed fields based on role
        const employeeAllowedFields = ['firstName', 'lastName', 'phone', 'address', 'profilePicUrl'];
        const adminAllowedFields = [
            'firstName', 'lastName', 'email', 'phone', 'address',
            'department', 'jobPosition', 'monthlyWage', 'dateOfBirth',
            'gender', 'maritalStatus', 'nationality', 'location',
            'accountNumber', 'bankName', 'ifscCode', 'panNumber', 'uanNumber',
        ];

        const allowedFields = requestingUserRole === Role.ADMIN ? adminAllowedFields : employeeAllowedFields;

        // Filter data based on permissions
        const filteredData: any = {};
        const employeeData: any = {};

        for (const [key, value] of Object.entries(data)) {
            // Skip undefined values (but allow null, empty strings, 0, and false)
            if (value === undefined) {
                continue;
            }

            if (allowedFields.includes(key)) {
                // Convert empty strings to null for optional fields
                const processedValue = value === '' ? null : value;

                if (['firstName', 'lastName', 'email', 'profilePicUrl'].includes(key)) {
                    // Don't allow null for required fields
                    if (processedValue !== null || key === 'profilePicUrl') {
                        filteredData[key] = processedValue;
                    }
                } else if (key === 'dateOfBirth' && processedValue) {
                    // Convert date string to DateTime
                    employeeData[key] = new Date(processedValue as string);
                } else {
                    // Allow null for optional employee fields (phone, address, etc.)
                    employeeData[key] = processedValue;
                }
            }
        }

        // Update user and employee
        const updatedUser = await prisma.$transaction(async (tx) => {
            if (Object.keys(filteredData).length > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: filteredData,
                });
            }

            if (Object.keys(employeeData).length > 0) {
                if (!user.employee) {
                    throw new NotFoundError('Employee record not found. Please contact administrator.');
                }
                await tx.employee.update({
                    where: { id: user.employee.id },
                    data: employeeData,
                });
            }

            // Fetch updated user with employee data
            return await tx.user.findUnique({
                where: { id: userId },
                include: {
                    employee: {
                        include: {
                            manager: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
            });
        });

        if (!updatedUser) {
            throw new NotFoundError('User not found after update');
        }

        const employee = updatedUser.employee;

        // Return updated profile in the same format as getProfile
        return {
            personal: {
                id: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                phone: employee?.phone,
                profilePic: updatedUser.profilePicUrl,
                dateOfBirth: employee?.dateOfBirth,
                gender: employee?.gender,
                maritalStatus: employee?.maritalStatus,
                nationality: employee?.nationality,
                address: employee?.address,
            },
            professional: {
                employeeCode: employee?.employeeCode,
                loginId: updatedUser.loginId,
                company: employee?.company,
                department: employee?.department,
                jobPosition: employee?.jobPosition,
                manager: employee?.manager ? {
                    id: employee.manager.userId,
                    name: `${employee.manager.user.firstName} ${employee.manager.user.lastName}`,
                    email: employee.manager.user.email,
                } : null,
                location: employee?.location,
                dateOfJoining: employee?.dateOfJoining,
                workSchedule: {
                    workingDays: employee?.workingDays,
                    dailyHours: employee?.dailyHours,
                    breakTime: employee?.breakTime,
                },
            },
            bank: {
                accountNumber: employee?.accountNumber,
                bankName: employee?.bankName,
                ifscCode: employee?.ifscCode,
                panNumber: employee?.panNumber,
                uanNumber: employee?.uanNumber,
            },
        };
    }

    /**
     * Upload profile picture
     */
    async uploadProfilePicture(userId: string, file: Express.Multer.File) {
        const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            {
                folder: 'hrms/profiles',
                public_id: `profile_${userId}`,
                overwrite: true,
            }
        );

        await prisma.user.update({
            where: { id: userId },
            data: { profilePicUrl: result.secure_url },
        });

        return { profilePicUrl: result.secure_url };
    }
}
