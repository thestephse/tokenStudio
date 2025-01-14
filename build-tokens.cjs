const StyleDictionary = require("style-dictionary");
const {
  registerTransforms,
  transforms,
} = require("@tokens-studio/sd-transforms");
const { promises } = require("node:fs");

registerTransforms(StyleDictionary);

StyleDictionary.registerTransformGroup({
  name: "custom/tokens-studio",
  transforms: [...transforms, "attribute/cti", "name/cti/kebab", "name/cti/camel", "ts/descriptionToComment",
  "ts/size/px",
  "ts/opacity",
  "ts/size/lineheight",
  "ts/type/fontWeight",
  "ts/resolveMath",
  "ts/size/css/letterspacing",
  "ts/typography/css/shorthand",
  "ts/border/css/shorthand",
  "ts/shadow/css/shorthand",
  "ts/color/css/hexrgba",
  "ts/color/modifiers" ],
});

const tokenFilter = (cat) => (token) => token.attributes.category === cat;

const generateFilesArr = (tokensCategories, theme) => {
  return tokensCategories.map((cat) => ({
    filter: tokenFilter(cat),
    destination: `${cat}/${cat}-${theme.toLowerCase()}.css`,
    format: "css/variables",
    options: {
      selector: ":host",
      fileHeader: "autoGeneratedFileHeader",
    },
  }));
};

async function run() {
  const $themes = JSON.parse(await promises.readFile("tokens/$themes.json"));
  const configs = $themes.map((theme) => ({
    source: Object.entries(theme.selectedTokenSets)
      .filter(([, val]) => val !== "disabled")
      .map(([tokenset]) => `tokens/${tokenset}.json`),
    fileHeader: {
      autoGeneratedFileHeader: () => {
        return [`Do not edit directly, this file was auto-generated`];
      },
    },
    platforms: {
      css: {
        transformGroup: "custom/tokens-studio",
        files: generateFilesArr(["button"], theme.name),
      },
    },
  }));

  configs.forEach((cfg) => {
    const sd = StyleDictionary.extend(cfg);
    sd.cleanAllPlatforms();
    sd.buildAllPlatforms();
  });
}
run();
