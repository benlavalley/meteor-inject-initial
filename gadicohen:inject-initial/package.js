// keeping this here as an example of how to allow a package override another package.

Package.describe({
	summary: 'Deprecated.  Use meteorhacks:inject-initial instead.',
	version: '1.0.2',
	git: 'https://github.com/meteorhacks/meteor-inject-initial.git',
	name: 'PACKAGE_DOESNT_EXIST________gadicohen:inject-initial',
});

Package.on_use(function (api) {
	api.use('meteorhacks:inject-initial@1.0.5');
	api.imply('meteorhacks:inject-initial');

	// XXX COMPAT WITH PACKAGES BUILT FOR 0.9.0.
	//
	// (in particular, packages that have a weak dependency on this
	// package, since then exported symbols live on the
	// `Package[gadicohen:inject-initial]` object)
	api.export('Inject', 'server');
	api.export(['Injected', 'Inject'], 'client');
});
