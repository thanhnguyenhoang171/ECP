export interface StorefrontSettings {
  header: {
    logoUrl: string;
    announcement: string;
    showAnnouncement: boolean;
    contactPhone: string;
  };
  hero: {
    banners: {
      id: string;
      imageUrl: string;
      link?: string;
      title?: string;
      isActive: boolean;
    }[];
  };
  appearance: {
    primaryColor: string;
    backgroundType: 'COLOR' | 'IMAGE';
    backgroundColor: string;
    backgroundImageUrl?: string;
    fontFamily: string;
  };
}
