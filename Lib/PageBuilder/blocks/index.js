import BannerAdminForm from "./Banner/AdminForm";
import BannerConfig from "./Banner/config";
import BannerFrontendView from "./Banner/FrontendView";

// service  details

import  ServicesDetailsFrontend from "./ServiceDetails/FrontendView";
import ServicesDetailsBackend from "./ServiceDetails/AdminForm"
import ServicesDetailsConfig from "./ServiceDetails/config"

// Sliders

import SlidersFrontend from "./slider/FrontendView"
import SlidersBackend from "./slider/AdminForm"
import SlidersConfig from "./slider/config"

export const BLOCK_REGISTRY = {
  banner: {
    ...BannerConfig,
    AdminForm: BannerAdminForm,
    FrontendView: BannerFrontendView,
  },
  Services_Details: {
    ...ServicesDetailsConfig,
    AdminForm:  ServicesDetailsBackend,
    FrontendView:  ServicesDetailsFrontend,
  },
  Sliders: {
    ...SlidersConfig,
    AdminForm:  SlidersBackend,
    FrontendView:  SlidersFrontend,
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
