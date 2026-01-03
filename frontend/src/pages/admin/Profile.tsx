import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Building, Save, Edit, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { profileService } from '@/services/profile.service';
import { ProfileData } from '@/types';
import { getImageUrlWithCacheBust } from '@/lib/utils';

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await profileService.getProfile(user.id);
      setProfileData(data);
      setFormData({
        phone: data.personal.phone || '',
        address: data.personal.address || '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to fetch profile data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      await profileService.updateProfile(user.id, {
        phone: formData.phone,
        address: formData.address,
      });
      
      await fetchProfile(); // Refresh profile data
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.response?.data?.error?.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        phone: profileData.personal.phone || '',
        address: profileData.personal.address || '',
      });
    }
    setIsEditing(false);
  };

  const getInitials = () => {
    if (profileData) {
      return `${profileData.personal.firstName[0]}${profileData.personal.lastName[0]}`.toUpperCase();
    }
    if (user) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'A';
  };

  const displayData = profileData || {
    personal: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      profilePic: user?.profilePic || null,
    },
    professional: {
      department: user?.department || '',
      jobPosition: user?.position || 'Admin',
      employeeCode: user?.employeeId || '',
    },
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const profilePicUrl = await profileService.uploadProfilePic(user.id, file);
      updateUser({ profilePic: profilePicUrl });
      
      // Refresh profile data
      await fetchProfile();

      toast({
        title: 'Profile photo updated',
        description: 'Your profile photo has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.response?.data?.error?.message || 'Failed to upload profile photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <PageContainer>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
                  <p className="text-muted-foreground mt-1">
                    View and manage your personal information
                  </p>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:col-span-1">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={getImageUrlWithCacheBust(displayData.personal.profilePic)} alt={displayData.personal.firstName} key={displayData.personal.profilePic} />
                          <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                          onClick={handlePhotoClick}
                          disabled={isUploadingPhoto}
                        >
                          {isUploadingPhoto ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </div>
                      <h2 className="text-xl font-semibold">
                        {displayData.personal.firstName} {displayData.personal.lastName}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">Admin</p>
                      <p className="text-sm text-muted-foreground">{displayData.professional.department || 'Department'}</p>
                      <Separator className="my-4" />
                      <div className="w-full space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{displayData.personal.email}</span>
                        </div>
                        {displayData.personal.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{displayData.personal.phone}</span>
                          </div>
                        )}
                        {displayData.professional.employeeCode && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground font-mono">{displayData.professional.employeeCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

          {/* Details Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{displayData.personal.firstName || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contact HR to change name</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{displayData.personal.lastName || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contact HR to change name</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{displayData.personal.email || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      disabled={isSaving}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{displayData.personal.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address, City, State, PIN Code"
                    disabled={isSaving}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{displayData.personal.address || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{displayData.professional.department || 'Not assigned'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contact HR to change department</p>
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{displayData.professional.jobPosition || 'Admin'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Contact HR to change position</p>
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{displayData.professional.employeeCode || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Join Date</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{displayData.professional.dateOfJoining ? new Date(displayData.professional.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
            </>
          )}
        </PageContainer>
      </main>
    </div>
  );
}

