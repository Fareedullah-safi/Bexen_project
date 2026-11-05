import BannerAdminForm from "./Banner/AdminForm";
import BannerConfig from "./Banner/config";
import BannerFrontendView from "./Banner/FrontendView";

// service  details
import ServicesDetailsAdminForm from "./ServiceDetails/AdminForm";
import ServicesDetailsConfig from "./ServiceDetails/config";
import ServicesDetailsFrontend from "./ServiceDetails/FrontendView";

// Sliders
import SlidersAdminForm from "./slider/AdminForm";
import SlidersConfig from "./slider/config";
import SlidersFrontend from "./slider/FrontendView";

//features
import FeaturesAdminForm from "./Features/AdminForm";
import FeaturesConfig from "./Features/config";
import FeaturesFrontend from "./Features/FrontendView";

// BrandLogos
import BrandLogosAdminForm from "./BrandLogos/AdminForm";
import BrandLogosFrontend from "./BrandLogos/BrandLogosView";
import BrandLogosConfig from "./BrandLogos/config";

// About-us
import AboutUsAdminForm from "./AboutUs/AdminForm";
import AboutUsConfig from "./AboutUs/config";
import AboutUsFrontendView from "./AboutUs/FrontendView";

// Team Members
import TeamMembersAdminForm from "./TeamMembers/AdminForm";
import TeamMembersConfig from "./TeamMembers/config";

// new Admin form
import NewsConfig from "./News/config";
import NewsAdminForm from "./News/NewsAdminForm";

// Albums
import AlbumsAdminForm from "./Albums/AlbumsAdminForm";
import AlbumsView from "./Albums/AlbumsView";
import AlbumsConfig from "./Albums/config";

// videos
import VideoGalleryConfig from "./VideoGallery/config";
import VideoGalleryAdmin from "./VideoGallery/VideoGalleryAdminForm";
import VideoGalleryView from "./VideoGallery/VideoGalleryView";
export const BLOCK_REGISTRY = {
  banner: {
    ...BannerConfig,
    AdminForm: BannerAdminForm,
    FrontendView: BannerFrontendView,
  },
  Services_Details: {
    ...ServicesDetailsConfig,
    AdminForm: ServicesDetailsAdminForm,
    FrontendView: ServicesDetailsFrontend,
  },
  Sliders: {
    ...SlidersConfig,
    AdminForm: SlidersAdminForm,
    FrontendView: SlidersFrontend,
  },
  Features: {
    ...FeaturesConfig,
    AdminForm: FeaturesAdminForm,
    FrontendView: FeaturesFrontend,
  },
  BrandLogos: {
    ...BrandLogosConfig,
    AdminForm: BrandLogosAdminForm,
    FrontendView: BrandLogosFrontend,
  },
  AboutUs: {
    ...AboutUsConfig,
    AdminForm: AboutUsAdminForm,
    FrontendView: AboutUsFrontendView,
  },
  Albums: {
    ...AlbumsConfig,
    AdminForm: AlbumsAdminForm,
    FrontendView: AlbumsView,
  },
  GalleryVideos: {
    ...VideoGalleryConfig,
    AdminForm: VideoGalleryAdmin,
    FrontendView: VideoGalleryView,
  },
  TeamMembers: {
    ...TeamMembersConfig,
    AdminForm: TeamMembersAdminForm,
    FrontendView: null, // ← add view later
  },

  News: {
    ...NewsConfig,
    AdminForm: NewsAdminForm,
    FrontendView: null,
  },
};

export const BLOCKS_LIST = Object.entries(BLOCK_REGISTRY).map(
  ([type, block]) => ({
    type,
    name: block.name,
    description: block.description,
    icon: block.icon,
  }),
);
