// Include gulp 
var gulp = require('gulp-help')(require('gulp')); 

// Include Our Plugins 
var jshint = require('gulp-jshint'); 
var concat = require('gulp-concat'); 
var uglify = require('gulp-uglify'); 
var rename = require('gulp-rename'); 
var sourcemaps = require('gulp-sourcemaps');
var filter = require('gulp-filter');
var bowerFiles = require('gulp-main-bower-files');
var less = require('gulp-less');
var del = require('del');
var exec = require('child_process').exec;

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefixPlugin = new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

var LessPluginCleanCSS = require('less-plugin-clean-css'),
    cleanCSSPlugin = new LessPluginCleanCSS({advanced: true});

var dev = './devApp';
var prod = './distApp';

var outputDev = {
	js: dev + '/static/js',
	jsVendors:dev + "/static/js/jsVendors",
	css:dev + "/static/style/css",
	img:dev + "/static/style/img",
	fonts:dev + "/static/style/fonts",
	python:dev 
};

var outputProd = {
	js: prod+'/distApp/static/js',
	jsVendors: prod+"/static/js/jsVendors",
	css: prod+"/static/style/css",
	img: prod+"/static/style/img",
	fonts: prod+"/static/style/fonts",
	python:prod
};

var src = {
	js:'./devAsset/js/*.js',
	less:['./devAsset/less/*.less','./devAsset/less/**/*.less'],
	img:'./devAsset/img/*.*',
	fonts:'./devAsset/fonts/**/*.*',
	bower:['./devAsset/bower.json','./devAsset/bowerrc','./devAsset/bower_components/**/fonts/*.*'],
	otherVendors:['./devAsset/otherVendors/**/*.js','./devAsset/otherVendors/**/*.css'],
	python:'./devAsset/python/**'
};

var filterByExtension = function(extension) {
	return filter(function (file){
		return file.path.match(new RegExp('.'+extension+'$'));
	})
};

gulp.task('cleanProd','delete distribution folder',function(){
	return del(prod)
});

gulp.task('initProd','initialize distribution folder',['cleanProd'],function(){
	return gulp.src('./modelApp/**')
			.pipe(gulp.dest(prod));
});

gulp.task('cleanDev','delete dev application folder',function(){
	return del(dev)
});

gulp.task('initDev','initialize dev application folder',['cleanDev'],function(){
	return gulp.src('./modelApp/**')
			.pipe(gulp.dest(dev));

});
//bowerJs for dev env 
gulp.task('bowerJs','tranfert all lib form bower to dev application folder',function(){
	var jsFilter = filterByExtension('js')
	return gulp.src(src.bower[0])
			.pipe(bowerFiles())
			.pipe(jsFilter)
			.pipe(gulp.dest(outputDev.jsVendors));
});

//bowerJs for prod env
gulp.task('bowerJsProd','tranfert all lib form bower to distribution folder',function(){
	var jsFilter = filterByExtension('js')
	return gulp.src(src.bower[0])
			.pipe(bowerFiles())
			.pipe(jsFilter)
			.pipe(gulp.dest(outputProd.jsVendors));
});

// Lint Task 
gulp.task('lint','lint all js file in developement application folder', function() { 
	return gulp.src(src.js) 
		.pipe(jshint()) 
		.pipe(jshint.reporter('default')); 
}); 

// Compile Our less for dev 
gulp.task('less','Compile (autoprefix) and inject css into developement application folder', function() { 
	return gulp.src(src.less[0]) 
		.pipe(sourcemaps.init())
		.pipe(less({ plugins: [autoprefixPlugin] })) 
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(outputDev.css)); 
}); 

//move font 
gulp.task('fonts','move font to all application folder',function(){
	return gulp.src(src.fonts)
			.pipe(gulp.dest(outputDev.fonts))
			.pipe(gulp.dest(outputProd.fonts));

});

// Compile Our less for prod
gulp.task('lessDist', 'Compile (autoprefix,nimify) and inject css into distribution folder',function() { 
	return gulp.src(src.less[0]) 
		.pipe(less({ plugins: [autoprefixPlugin,cleanCSSPlugin] })) 
		.pipe(gulp.dest(outputProd.css)); 
});

//move python file to dev & prod
gulp.task('python','inject python flask file into distribution and developement application folder',function(){
	return gulp.src(src.python)
			.pipe(gulp.dest(dev))
			.pipe(gulp.dest(prod));
});

// Concatenate & Minify JS for production
	gulp.task('scripts', 'Concatenate & Minify JS for distribution folder', function() { 
		return gulp.src('js/*.js') 
			.pipe(concat('all.js')) 
			.pipe(gulp.dest('dist')) 
			.pipe(rename('all.min.js')) 
			.pipe(uglify()) 
			.pipe(gulp.dest('dist')); }); 

// Watch Files For Changes 
	gulp.task('watchDev','watch dev file to inject into developement application folder',function() { 
		gulp.watch(src.less[1],['less']);
		gulp.watch(src.less,['less']);
		gulp.watch(src.python,['python']);
		gulp.watch(src.fonts,['fonts']) 
		gulp.watch(src.bower[0], ['bowerJs']); 
	}); 

// Default 
gulp.task('buildProd','build all distribution file',['bowerJsProd','lessDist','fonts']);
gulp.task('buildDev','build all developement application file',['bowerJs','less','fonts','lint','python','watchDev'])
gulp.task('default', ['help']);
