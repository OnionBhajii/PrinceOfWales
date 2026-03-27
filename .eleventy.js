module.exports = function(eleventyConfig) {
  // Tell Eleventy to pass these files directly to the final build
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/images");

  return {
    // IMPORTANT: If your GitHub repo is named "pub-site", change this to "/pub-site/"
    // If your repo is exactly "yourusername.github.io", leave it as "/"
    pathPrefix: "/PrinceOfWales", 
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    }
  };
};