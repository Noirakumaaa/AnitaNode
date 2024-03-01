module.exports = {
  // ... other webpack options ...
  resolve: {
    fallback: {
      https: require.resolve('https-browserify'),
    },
  },
};
