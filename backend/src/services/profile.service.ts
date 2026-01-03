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
        const employeeAllowedFields = ['phone', 'address', 'profilePicUrl'];
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
            if (allowedFields.includes(key)) {
                if (['firstName', 'lastName', 'email', 'profilePicUrl'].includes(key)) {
                    filteredData[key] = value;
                } else {
                    employeeData[key] = value;
                }
            }
        }

        // Update user and employee
        await prisma.$transaction(async (tx) => {
            if (Object.keys(filteredData).length > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: filteredData,
                });
            }

            if (Object.keys(employeeData).length > 0 && user.employee) {
                await tx.employee.update({
                    where: { id: user.employee.id },
                    data: employeeData,
                });
            }
        });
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
