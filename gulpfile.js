// Include gulp 
var gulp = require('gulp'); 

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
	font:dev + "/static/style/font",
	python:dev 
};

var outputProd = {
	js: prod+'/distApp/static/js',
	jsVendors: prod+"/static/js/jsVendors",
	css: prod+"/static/style/css",
	img: prod+"/static/style/img",
	font: prod+"/static/style/font",
	python:prod
};

var src = {
	js:'./devAsset/js/*.js',
	less:'./devAsset/less/**/*.less',
	img:'./devAsset/img/*.*',
	font:'./devAsset/font/*.*',
	bower:['./devAsset/bower.json','./devAsset/bowerrc','./devAsset/bower_components/**/fonts/*.*'],
	otherVendors:['./devAsset/otherVendors/**/*.js','./devAsset/otherVendors/**/*.css'],
	python:'./devAsset/python/**'
};

var filterByExtension = function(extension) {
	return filter(function (file){
		return file.path.match(new RegExp('.'+extension+'$'));
	})
};

gulp.task('cleanProd',function(){
	return del(prod)
});

gulp.task('initProd',['cleanProd'],function(){
	return gulp.src('./modelApp/**')
			.pipe(gulp.dest(prod));
});

gulp.task('cleanDev',function(){
	return del(dev)
});

gulp.task('initDev',['cleanDev'],function(){
	return gulp.src('./modelApp/**')
			.pipe(gulp.dest(dev));

});
//bowerJs for dev env 
gulp.task('bowerJs',function(){
	var jsFilter = filterByExtension('js')
	return gulp.src(src.bower[0])
			.pipe(bowerFiles())
			.pipe(jsFilter)
			.pipe(gulp.dest(outputDev.jsVendors));
});

//bowerJs for prod env
gulp.task('bowerJsProd',function(){
	var jsFilter = filterByExtension('js')
	return gulp.src(src.bower[0])
			.pipe(bowerFiles())
			.pipe(jsFilter)
			.pipe(gulp.dest(outputProd.jsVendors));
});

// Lint Task 
gulp.task('lint', function() { 
	return gulp.src(src.js) 
		.pipe(jshint()) 
		.pipe(jshint.reporter('default')); 
}); 

// Compile Our less for dev 
gulp.task('less', function() { 
	return gulp.src(src.less) 
		.pipe(sourcemaps.init())
		.pipe(less({ plugins: [autoprefixPlugin] })) 
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(outputDev.css)); 
}); 

// Compile Our less for prod
gulp.task('lessDist', function() { 
	return gulp.src(src.less) 
		.pipe(less({ plugins: [autoprefixPlugin,cleanCSSPlugin] })) 
		.pipe(gulp.dest(outputProd.css)); 
});

//move python file to dev & prod
gulp.task('python',function(){
	return gulp.src(src.python)
			.pipe(gulp.dest(dev))
			.pipe(gulp.dest(prod));
});

// Concatenate & Minify JS for production
	gulp.task('scripts', function() { 
		return gulp.src('js/*.js') 
			.pipe(concat('all.js')) 
			.pipe(gulp.dest('dist')) 
			.pipe(rename('all.min.js')) 
			.pipe(uglify()) 
			.pipe(gulp.dest('dist')); }); 

// Watch Files For Changes 
	gulp.task('watchDev', function() { 
		gulp.watch(src.less,['less']);
		gulp.watch(src.python,['python']); 
		//gulp.watch('scss/*.scss', ['sass']); 
	}); 


// Default 
gulp.task('buildProd',['bowerJsProd','lessDist']);
gulp.task('buildDev',['bowerJs','less','lint','python','watchDev'])
gulp.task('default', ['lint', 'less', 'scripts', 'watch']);
