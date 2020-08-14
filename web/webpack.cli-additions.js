const fs = require('fs');
const commonCliConfig = 'node_modules/@angular/cli/models/webpack-configs/common.js';
const addition_rules = `
  { test: /\.(pug|jade)$/, loader: 'apply-loader' },
  { test: /\.(pug|jade)$/,
    loader: 'pug-loader',
    query: { doctype: 'html', plugins: [require('pug-plugin-ng')] },
  },
  {
    test: /\.js$/,
    use: [{
      loader:  'babel-loader',
      options: {
        presets: ['env'],
      }
    }],
  },
  { test: /\.md$/, use: [{ loader: 'raw-loader' }, { loader: 'markdown-loader', }] }
  ,`; // make sure to have this last comma

fs.readFile(commonCliConfig, (err, data) => {

  if (err) { throw err; }

  const configText = data.toString();
  // make sure we don't include it (if we've already done this)
  if (configText.indexOf(addition_rules) > -1) { return; }

  console.log('-- Inserting additional webpack rules to node_modules CLI -- ');

  const position = configText.indexOf('rules: [') + 8;
  const output = [configText.slice(0, position), addition_rules, configText.slice(position)].join('');
  fs.writeFileSync(commonCliConfig, output);
});

