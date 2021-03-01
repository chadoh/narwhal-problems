🐳 Narwhal Problems 💰
======================

An app for helping NEAR Whales (narwhals) carry their heavy bags of tokens.
Poor narwhals!


Are you a narwhal, too?
=======================

Do you have several buckets full of NEAR tokens?

Do you have these spread out across multiple hardware and/or software wallets?

Do you already have trouble keeping track of all that, and then a need to keep
track of lockup contracts, delegation decisions, staking rewards, and starting
balances?

This app is for you!


Run it locally
==============

* Make sure you have [Node.js] and the latest [yarn] installed
* Clone the code
* `cd` into the repo

This project uses [Yarn 2](https://yarnpkg.com/getting-started/migration) in [Zero-Install mode](https://yarnpkg.com/features/zero-installs) so you shouldn't have to run `yarn install` when you first clone this repository.

If you use an editor other than VS Code or vim to work on this codebase, you may want to add Yarn 2 editor support to your local project [using `yarn dlx @yarnpkg/pnpify --sdk`](https://yarnpkg.com/getting-started/editor-sdks). Settings for VS Code & vim are checked into the repo.

Now you should be able to run project scripts:

* `yarn start`

You should also see eslint & TypeScript support in your editor.

  [Node.js]: https://nodejs.org/en/download/package-manager/
  [yarn]: https://yarnpkg.com/



Bonus Features For People Running It Locally
============================================

This project has a couple files in `gitignore` for you. This means if you create these files, you won't accidentally commit them to the codebase.

* `accounts.js` – go ahead and copy the data from the app into this file for a less-transient way to store it
* `picking-validators.md` – you can use this file as a handy personal notepad when figuring out which validators to delegate to