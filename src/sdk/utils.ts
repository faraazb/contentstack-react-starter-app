import {
  Config,
  Region,
  LivePreview,
  Stack,
  LivePreivewConfigWithPreviewToken,
  LivePreivewConfigWithManagementToken
} from "contentstack";
const {
  REACT_APP_CONTENTSTACK_API_KEY,
  REACT_APP_CONTENTSTACK_DELIVERY_TOKEN,
  REACT_APP_CONTENTSTACK_ENVIRONMENT,
  REACT_APP_CONTENTSTACK_BRANCH,
  REACT_APP_CONTENTSTACK_REGION,
  REACT_APP_CONTENTSTACK_MANAGEMENT_TOKEN,
  REACT_APP_CONTENTSTACK_API_HOST,
  REACT_APP_CONTENTSTACK_APP_HOST,
  REACT_APP_CONTENTSTACK_LIVE_PREVIEW,
  REACT_APP_CONTENTSTACK_PREVIEW_TOKEN,
  REACT_APP_CONTENTSTACK_PREVIEW_HOST,
} = process.env;

// basic env validation
export const isBasicConfigValid = () => {
  return (
    !!REACT_APP_CONTENTSTACK_API_KEY &&
    !!REACT_APP_CONTENTSTACK_DELIVERY_TOKEN &&
    !!REACT_APP_CONTENTSTACK_ENVIRONMENT
  );
};
// Live preview config validation
export const isLpConfigValid = () => {
  if (!!REACT_APP_CONTENTSTACK_LIVE_PREVIEW &&
    !!REACT_APP_CONTENTSTACK_APP_HOST) {
    if (
      (!!REACT_APP_CONTENTSTACK_MANAGEMENT_TOKEN &&
        !!REACT_APP_CONTENTSTACK_API_HOST) ||
      (!!REACT_APP_CONTENTSTACK_PREVIEW_TOKEN &&
        !!REACT_APP_CONTENTSTACK_PREVIEW_HOST)
    ) {
      return true;
    }
    return false;
  }
  return false;
};
// set region
const setRegion = (): Region => {
  let region = "US" as keyof typeof Region;
  if (!!REACT_APP_CONTENTSTACK_REGION && REACT_APP_CONTENTSTACK_REGION !== "us") {
    region = REACT_APP_CONTENTSTACK_REGION.toLocaleUpperCase().replace(
      "-",
      "_"
    ) as keyof typeof Region;
  }
  return Region[region];
};

type setLivePrevieConfig = undefined | (LivePreview & (LivePreivewConfigWithPreviewToken | LivePreivewConfigWithManagementToken));

// set LivePreview config
const setLivePreviewConfig = (): setLivePrevieConfig => {
  if (!isLpConfigValid())
    throw new Error("Your LP config is set to true. Please make you have set all required LP config in .env");
  if (
    !!REACT_APP_CONTENTSTACK_MANAGEMENT_TOKEN &&
    !!REACT_APP_CONTENTSTACK_API_HOST) {
    return {
      enable: REACT_APP_CONTENTSTACK_LIVE_PREVIEW === "true",
      management_token: REACT_APP_CONTENTSTACK_MANAGEMENT_TOKEN as string,
      host: REACT_APP_CONTENTSTACK_API_HOST as string,
    }
  }
  else if (
    !!REACT_APP_CONTENTSTACK_PREVIEW_TOKEN &&
    !!REACT_APP_CONTENTSTACK_PREVIEW_HOST) {
    return {
      enable: REACT_APP_CONTENTSTACK_LIVE_PREVIEW === "true",
      preview_token: REACT_APP_CONTENTSTACK_PREVIEW_TOKEN as string,
      host: REACT_APP_CONTENTSTACK_PREVIEW_HOST as string,
    }
  }
  return;
};
// contentstack sdk initialization
export const initializeContentStackSdk = (): Stack => {
  if (!isBasicConfigValid())
    throw new Error("Please set you .env file before running starter app");
  const stackConfig: Config = {
    api_key: REACT_APP_CONTENTSTACK_API_KEY as string,
    delivery_token: REACT_APP_CONTENTSTACK_DELIVERY_TOKEN as string,
    environment: REACT_APP_CONTENTSTACK_ENVIRONMENT as string,
    region: setRegion(),
    branch: REACT_APP_CONTENTSTACK_BRANCH || "main",
  };
  if (REACT_APP_CONTENTSTACK_LIVE_PREVIEW === "true") {
    stackConfig.live_preview = setLivePreviewConfig();
  }
  return Stack(stackConfig);
};
// api host url
export const customHostUrl = (baseUrl: string): string => {
  return baseUrl.replace(/api|rest-preview/, "cdn");
};
// generate prod api urls
export const generateUrlBasedOnRegion = (): string[] => {
  return Object.keys(Region).map((region) => {
    if (region === "US") {
      return `cdn.contentstack.io`;
    }
    return `${region}-cdn.contentstack.com`;
  });
};
// prod url validation for custom host
export const isValidCustomHostUrl = (url: string): boolean => {
  return url ? !generateUrlBasedOnRegion().includes(url) : false;
};
