import BannerAdminForm from "./Banner/AdminForm";
import BannerConfig from "./Banner/config";
import BannerFrontendView from "./Banner/FrontendView";

// service  details

import ServicesDetailsBackend from "./ServiceDetails/AdminForm";
import ServicesDetailsConfig from "./ServiceDetails/config";
import ServicesDetailsFrontend from "./ServiceDetails/FrontendView";

// Sliders

import SlidersBackend from "./slider/AdminForm";
import SlidersConfig from "./slider/config";
import SlidersFrontend from "./slider/FrontendView";

//features

import FeaturesBackend from "./Features/AdminForm";
import FeaturesConfig from "./Features/config";
import FeaturesFrontend from "./Features/FrontendView";

export const BLOCK_REGISTRY = {
  banner: {
    ...BannerConfig,
    AdminForm: BannerAdminForm,
    FrontendView: BannerFrontendView,
  },
  Services_Details: {
    ...ServicesDetailsConfig,
    AdminForm: ServicesDetailsBackend,
    FrontendView: ServicesDetailsFrontend,
  },
  Sliders: {
    ...SlidersConfig,
    AdminForm: SlidersBackend,
    FrontendView: SlidersFrontend,
  },
  Features: {
    ...FeaturesConfig,
    AdminForm: FeaturesBackend,
    FrontendView: FeaturesFrontend,
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
