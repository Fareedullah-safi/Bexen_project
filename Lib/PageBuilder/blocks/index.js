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
};

export const BLOCKS_LIST = Object.entries(BLOCK_REGISTRY).map(
  ([type, block]) => ({
    type,
    name: block.name,
    description: block.description,
    icon: block.icon,
  }),
);
