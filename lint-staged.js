module.exports = {
  './libraries/**/*.+(js|ts|tsx)': ['yarn lint:fix', 'yarn lint'],
  './libraries/**/*.{js,jsx,ts,tsx,json,css,scss,md}': ['yarn format:write', 'yarn format:check'],
}
