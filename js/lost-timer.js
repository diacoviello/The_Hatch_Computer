/**
 * Lost Timer
 *
 * Handle all lost countdown timer functionality.
 *
 * @package		lost-timer
 * @author		Justin Stolpe
 * @link		https://github.com/jstolpe/lost-timer
 * @version     1.0.0
 */
var lostTimer = ( function() {
	/**
	 * Constructor function
	 *
	 * @param Object args
	 * 		str mode 	        (optional|defaults to 'live') mode to load timer in
	 * 		str initialSeconds 	(optional|defaults to 108) seconds to start the timer at
	 * 		str height       	(optional|defaults to 200) height of the timer
	 * 		fun onTick       	(optional) run custom javascript on timer tick down
	 *
	 * @return void
	 */
	var lostTimer = function( args ) {
		// give us our self
		var self = this;

		// html container class the timer will populate
		self.containerClass = 'lost-timer';
		self.containerClassCss = '.' + self.containerClass;

		// check if mode or no
		self.theNumbersString = '4 8 15 16 23 42';

		// check if mode or no
		self.mode = 'mode' in args ? args.mode : 'live';

		// store the initial seconds default to 108 minutes
		self.initialSeconds = 'initialSeconds' in args ? args.initialSeconds : ( 60 * 108 );

		// default height to 200 if not specified
		self.height = 'height' in args ? args.height : 200;
		self.width = self.height * .6;

		if ( typeof args.onTick !== 'undefined' ) { // bind custom function
			self.onTick = args.onTick;
	    }

		// create lost timer html and populate it to the container
		self.drawTimer();

		// update height/width/font-size/margin-left according to the height
		$( self.containerClassCss + ' .lost-flipper' ).css( 'height', self.height + 'px' );
		$( self.containerClassCss + ' .lost-flipper' ).css( 'width', self.width + 'px' );
		$( self.containerClassCss + ' .lost-flipper' ).css( 'font-size', ( self.height * .8 ) + 'px' );
		$( self.containerClassCss + ' .lost-timer-side-right' ).css( 'margin-left', ( self.width / 6 ) + 'px' );

		// setup audio for use
		self.setupAudio();

		// set the timer
		self.initializeTimer( args.initialSeconds );

		// start the timer countdown
        self.startTimer();
	};

	/**
	 * Draw the timer html to the dom
	 *
	 * @return void
	 */
	lostTimer.prototype.drawTimer=function() {
		// console.log( 'drawing timer' );
		// give us our self
		var self = this;

		// generate html for the timer
		var timerHtml = '<div class="lost-timer-side lost-timer-side-left">' + 
			self.getTimerNumberSlotHtml( 1 ) +
			self.getTimerNumberSlotHtml( 2 ) +
			self.getTimerNumberSlotHtml( 3 ) +
		'</div>' + 
		'<div class="lost-timer-side lost-timer-side-right">' + 
			self.getTimerNumberSlotHtml( 4 ) +
			self.getTimerNumberSlotHtml( 5 ) +
		'</div>';

		// add html to the container element
		$( self.containerClassCss ).html( timerHtml );

		// add end screen to the body
		$( 'body' ).append( '<div class="lost-timer-end-screen"></div>' );

		if ( 'dev' == self.mode ) {
			var devHtml = '<div class="' + self.containerClass + '-dev">' +
				'<div class="lost-timer-dev-main-text">' +
					'Mode: Dev' +
				'</div>' +
				'<div class="lost-timer-dev-main-text">' +
					'Timer: ' +
					'<span class="' + self.containerClass + '-timer">' +

					'</span>' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-set" data-seconds="6480">' + 
					'Set Timer to 108 minutes' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-set" data-seconds="240">' + 
					'Set Timer to 4 minutes' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-set" data-seconds="60">' + 
					'Set Timer to 1 minute' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-set" data-seconds="10">' + 
					'Set Timer to 10 seconds' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-sound">' + 
					'toggle sound' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-reset">' + 
					'reset timer' +
				'</div>' +
				'<div class="' + self.containerClass + '-dev-action ' + self.containerClass + '-dev-action-glyphs">' + 
					'roll glyphs' +
				'</div>' +
			'</div>';

			// add html to the container element
			$( self.containerClassCss ).append( devHtml );

			$( self.containerClassCss + '-dev-action-reset' ).on( 'click', function () { // on click for timer reset
				self.reset();
			} );

			$( self.containerClassCss + '-dev-action-set' ).on( 'click', function () { // on click for setting the initial seconds
				window.location.href = '?mode=dev&seconds=' + $( this ).data( 'seconds' );
			} );

			$( self.containerClassCss + '-dev-action-glyphs' ).on( 'click', function () { // on click for rolling glyphs
				self.rollGlyphs();
			} );

			$( self.containerClassCss + '-dev-action-sound' ).on( 'click', function() { // on click for toggle sound
				// toggle sound for all timer audio sounds
				var bool = $( '.lost-timer-audio' ).prop( 'muted' );
		        $( '.lost-timer-audio' ).prop( 'muted', !bool );
			} );
		}
	};

	/**
	 * Get html for a numbers slot
	 *
	 * @params int number the number slot to get html for
	 *
	 * @return string
	 */
	lostTimer.prototype.getTimerNumberSlotHtml=function( number ) {
		// console.log( 'getting timer number slot html for number ' + number );
		// deteremine background color
		var backgroundColor = number > 3 ? 'white' : 'black';

		// return html for the timer number slot
		return '<div class="lost-timer-number">' +
			'<div class="lost-timer-number-inner">' +
				'<div class="lost-flipper lost-flipper-bg-' + backgroundColor + ' lost-timer-number-' + number + '">' +
				  	'<span class="lost-flipper-number lost-flipper-next">' +
				  		'<div class="lost-flipper-number-before">' +
				  			'<div class="lost-flipper-number-table">' +
				  				'<div class="lost-flipper-number-table-cell">' +
				  					
				  				'</div>' +
				  			'</div>' +
				  		'</div>' +
				  		'<div class="lost-flipper-number-after lost-flipper-next-after-number">' +
				  			'<div class="lost-flipper-number-table">' +
				  				'<div class="lost-flipper-number-table-cell">' +
				  					
				  				'</div>' +
				  			'</div>' +
				  		'</div>' +
				  	'</span>' +
				  	'<span class="lost-flipper-number lost-flipper-prev">' +
				  		'<div class="lost-flipper-number-before">' +
				  			'<div class="lost-flipper-number-table">' +
				  				'<div class="lost-flipper-number-table-cell">' +
				  					
				  				'</div>' +
				  			'</div>' +
				  		'</div>' +	
				  		'<div class="lost-flipper-number-after">' +
				  			'<div class="lost-flipper-number-table">' +
				  				'<div class="lost-flipper-number-table-cell">' +
				  					
				  				'</div>' +
				  			'</div>' +
				  		'</div>' +
					' </span>' +
				'</div>' +
				'<div class="lost-timer-number-center-bar">' +
						
				'</div>' +
			'</div>' +
		'</div>';
	};

	/**
	 * Setup audio for timer to use
	 *
	 * @return void
	 */
	lostTimer.prototype.setupAudio = function() {
		// get self
		var self = this;

		// path to sounds
		self.soundsFolderPath = 'assets/sounds/';

		self.sounds = [ // sounds we have available
			'alarm',
			'beep',
			'discharge',
			'keypress',
			'reset',
			'spinup',
			'systemfailure',
			'thud',
			'tick',
			'timeout'
		];

		for ( var i = 0; i < self.sounds.length; i++ ) { // loop over sounds
			// create the class name for the audio
			var audioClassName = self.containerClass + '-audio-' + self.sounds[i];

			// html for the audio element
			var audioHtml = '<audio class="' + self.containerClass + '-audio ' + audioClassName + '" src="' + self.soundsFolderPath + self.sounds[i] + '.mp3" type="audio/mp3"></audio>';

			// append audio html to the container
			$( self.containerClassCss ).append( audioHtml );

			if ( 'dev' == self.mode ) { // display sounds with links for clicking and playing
				// sound play link
				var soundHtml = '<div class="lost-timer-dev-action ' + self.containerClass + '-play-' + self.sounds[i] + '">' +
					'play ' + self.sounds[i] +
				'</div>';

				// add to html
				$( self.containerClassCss + '-dev' ).append( soundHtml );

				// onclick for playing the sound
				$( self.containerClassCss + '-play-' + self.sounds[i] ).on( 'click', { sound: self.sounds[i] }, function( event ) {
					self.playAudio( event.data.sound );
				} );
			}
		}
	};

	/**
	 * Play audio file
	 *
	 * @params str key      name of the audio file name
	 * @params boo restart  (optional) rewind to the start so the sound retriggers from the beginning
	 *
	 * @return void
	 */
	lostTimer.prototype.playAudio=function( key, restart ) {
		// console.log( 'playing audio with key: ' + key );
		// get self
		var self = this;

		// the audio element for this sound
		var audio = $( self.containerClassCss + '-audio-' + key )[0];

		if ( restart ) { // rewind so the sound plays fresh from the start
			audio.currentTime = 0;
		}

		// play specified audio by key
		audio.play();
	};

	/**
	 * Initialize the timer with the seconds
	 *
	 * @params int initialSeconds seconds to start the timer at
	 *
	 * @return void
	 */
	lostTimer.prototype.initializeTimer=function( initialSeconds ) {
		// console.log( 'initializing timer with ' + initialSeconds + ' seconds' );
		// give us our self
		var self = this;

		// set total seconds for timer to the initial seconds
		self.totalSeconds = self.initialSeconds;	

		// set minutes/seconds to total seconds
		self.minutes = self.totalSeconds;
		self.seconds = self.totalSeconds;

		// update time vars
		self.updateTimeVars();

		// update the number slots html
		self.updateNumbers( false );		
	};

	/**
	 * Update the timer numbers
	 *
	 * @params boo isRandom true if the numbers should be random or false if numbers should be set
	 *
	 * @return void
	 */
	lostTimer.prototype.updateNumbers=function( isRandom ) {
		// console.log( 'updating numbers with isRandom: ' + isRandom );
		// give us our self
		var self = this;

		// min/max numbers for reset numbers to grab at random
		var min = 0;
		var max = 9;

		$( self.containerClassCss + '-number-1 .lost-flipper-number-table-cell' ).html( ( isRandom ? self.getRandomNumber( min, max ) : self.num1 ) );
		$( self.containerClassCss + '-number-2 .lost-flipper-number-table-cell' ).html( ( isRandom ? self.getRandomNumber( min, max ) : self.num2 ) );
		$( self.containerClassCss + '-number-3 .lost-flipper-number-table-cell' ).html( ( isRandom ? self.getRandomNumber( min, max ) : self.num3 ) );
		$( self.containerClassCss + '-number-4 .lost-flipper-number-table-cell' ).html( ( isRandom ? self.getRandomNumber( min, max ) : self.num4 ) );
		$( self.containerClassCss + '-number-5 .lost-flipper-number-table-cell' ).html( ( isRandom ? self.getRandomNumber( min, max ) : self.num5 ) );
	};

	/**
	 * Update timer object variables
	 *
	 * @return void
	 */
	lostTimer.prototype.updateTimeVars=function() {
		// console.log( 'updating time vars' );
		// get self
		var self = this;

		// calculate minutes and seconds
        if ( self.totalSeconds >= 240 ) { // above four minutes only the minutes show, so hold each
        	// minute until the seconds reach 00 ( e.g. 108 stays until 107:00, then flips to 107 )
        	self.minutes = Math.ceil( self.totalSeconds / 60 );
        	self.seconds = 0;
        } else { // last four minutes display normal minutes:seconds
        	self.minutes = parseInt( self.totalSeconds / 60 );
        	self.seconds = parseInt( self.totalSeconds % 60 );
        }

        if ( self.minutes < 100 && self.minutes > 9 ) { // two digit range needing one zero
        	self.minutes = '0' + self.minutes;
        } else { // three digit range needing two zeros
        	self.minutes = self.minutes < 100 ? "00" + self.minutes : self.minutes;
        }

        // set the second adding a zero if needed
        self.seconds = self.seconds < 10 ? "0" + self.seconds : self.seconds;

        // get individual numbers
        self.num1 = parseInt( String( self.minutes ).charAt( 0 ) );
        self.num2 = parseInt( String( self.minutes ).charAt( 1 ) );
        self.num3 = parseInt( String( self.minutes ).charAt( 2 ) );
        self.num4 = parseInt( String( self.seconds ).charAt( 0 ) );
        self.num5 = parseInt( String( self.seconds ).charAt( 1 ) );
	};

	/**
	 * Start the timer countdown
	 *
	 * @return void
	 */
	lostTimer.prototype.startTimer=function() {
		// console.log( 'starting timer' );
		// get self
		var self = this;

		self.timer = setInterval( function () {
			self.onTick();

			if ( self.totalSeconds % 60 == 0 || self.totalSeconds < 240 ) { // tick each minute boundary, and every second below four minutes
				self.playAudio( 'tick' );
			}

			if ( self.totalSeconds <= 240 && self.totalSeconds % 2 == 0 && self.totalSeconds > 60 ) { // play beep below four minutes and even number
				self.playAudio( 'beep' );
			}

			if ( self.totalSeconds < 10 ) { // final ten seconds: a fresh alarm every second
				self.playAudio( 'alarm', true );
			} else if ( self.totalSeconds <= 60 && self.totalSeconds % 2 == 0 ) { // last minute: alarm every other second
				self.playAudio( 'alarm' );
			}

    		self.updateTimeVars();

	        if ( 'dev' == self.mode ) { // update js timer with the real remaining time ( ticks every second )
	       		var devMinutes = parseInt( self.totalSeconds / 60 );
	       		var devSeconds = self.totalSeconds % 60;
	       		$( self.containerClassCss + '-timer' ).html( devMinutes + ":" + ( devSeconds < 10 ? "0" + devSeconds : devSeconds ) );
	       	}

	        // always try and flip the first three numbers
	        self.flip( '1', self.num1 );
	        self.flip( '2', self.num2 );
	        self.flip( '3', self.num3 );

	        if ( self.totalSeconds < 240 ) { // under four minutes display and flip seconds
	        	self.flip( '4', self.num4 );
	        	self.flip( '5', self.num5 );
	       	} 

	        if ( --self.totalSeconds < 0 ) { // decrement total seconds and check if less than zero
	            // clear the timer interval so it stops
				clearInterval( self.timer );
	            
	            setTimeout( function() { // wait one seconds and then roll glyphs
					self.rollGlyphs();
				}, 1000 );
	        }
	    }, 1000 ); 
	};

	/**
	 * Update the timer numbers
	 *
	 * @params int number number slot to try and flip to the next number
	 * @params int value value for the target flipper
	 * @params fun onComplete (optional) run once the fold finishes ( used to chain the fast spin )
	 *
	 * @return void
	 */
	lostTimer.prototype.flip=function( number, value, onComplete ) {
		// get self
		var self = this;

		var flipperClassName = self.containerClassCss + '-number-' + number;

		if ( String( value ) != $( flipperClassName + ' .lost-flipper-prev .lost-flipper-number-table-cell' ).html() ) { // only flip if next/prev numbers are different
	      	// update the next number to the value
	      	$( flipperClassName + ' .lost-flipper-next .lost-flipper-number-table-cell' ).html( value );

	      	// save current elements with clone
	        var flipperNext = $( flipperClassName + ' .lost-flipper-next' ).clone();
			var flipperNextAfter = $( flipperClassName + ' .lost-flipper-next .lost-flipper-number-after' ).clone();
			var flipperPrevBefore = $( flipperClassName + ' .lost-flipper-prev .lost-flipper-number-before' ).clone();

			// force the browser to acknowledge the rest state so back to back folds animate instead of jumping
			void $( flipperClassName )[0].offsetHeight;

			// make flip transform active
			$( flipperClassName + ' .lost-flipper-next' ).addClass( 'lost-flipper-next-active' );
			$( flipperClassName + ' .lost-flipper-next .lost-flipper-number-after' ).addClass( 'lost-flipper-next-after-active' );

			$( flipperClassName + ' .lost-flipper-prev .lost-flipper-number-before' ).addClass( 'lost-flipper-prev-before-active' ).one( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() { // do things once flip transform is complete
				// replace with the clones so the css transform resets
			   	$( flipperClassName + ' .lost-flipper-next' ).replaceWith( flipperNext );
				$( flipperClassName + ' .lost-flipper-next .lost-flipper-number-after' ).replaceWith( flipperNextAfter );
				$( flipperClassName + ' .lost-flipper-prev .lost-flipper-number-before' ).replaceWith( flipperPrevBefore );

				// update the prev number to the value
				$( flipperClassName + ' .lost-flipper-prev .lost-flipper-number-table-cell' ).html( value );

				// continue the chained spin once this fold has fully reset
				if ( onComplete ) { onComplete(); }
			} );
		} else if ( onComplete ) { // nothing different to fold, keep the chain going
			onComplete();
		}
	};

	/**
	 * Get a random number including the min/max passed in
	 *
	 * @params int min minimum value for the random number
	 * @params int max maximum value for the random number
	 *
	 * @return int
	 */
	lostTimer.prototype.getRandomNumber=function( min, max ) {
		// generate random number between min and max and include the max
		return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
	};

	/**
	 * Get a random number in [min,max] for a slot while avoiding values shown too
	 * recently in that slot, so symbols don't repeat and visibly stall in the fast flip.
	 *
	 * @params int number     number slot the value is for
	 * @params int min        minimum value for the random number
	 * @params int max        maximum value for the random number
	 * @params int avoidCount how many recently used values to avoid repeating
	 *
	 * @return int
	 */
	lostTimer.prototype.getRandomNonRepeating=function( number, min, max, avoidCount ) {
		// get self
		var self = this;

		// per slot history of the values used recently
		self.recentSymbols = self.recentSymbols || {};
		var recent = self.recentSymbols[number] || [];

		// pick a value that has not been used too recently ( give up after a few tries )
		var value, attempts = 0;
		do {
			value = self.getRandomNumber( min, max );
		} while ( recent.indexOf( value ) !== -1 && ++attempts < 20 );

		// remember it and trim the history down to the avoid window
		recent.push( value );
		while ( recent.length > avoidCount ) {
			recent.shift();
		}
		self.recentSymbols[number] = recent;

		return value;
	};

	/**
	 * Get html for glyph
	 *
	 * @params int lostTimerNumber number slot ( sets the glyph color )
	 * @params boo isRandom if true get random glyph html else get specified glyph
	 * @params int glyphNumberOverride (optional) use this exact glyph image ( 1-5 )
	 *
	 * @return int
	 */
	lostTimer.prototype.getGlyphHtml = function( lostTimerNumber, isRandom, glyphNumberOverride ) {
		// get self
		var self = this;

		// use the explicit glyph image if given, else a random one (1-5), else the slot's own number
		var glyphNumber = ( typeof glyphNumberOverride !== 'undefined' ) ? glyphNumberOverride : ( isRandom ? self.getRandomNumber( 1, 5 ) : lostTimerNumber );

		// set color of the glyph text so we can generate the background color
		var glyphColor = lostTimerNumber > 3 ? 'black' : 'red';

		if ( self.height > 333 ) { // large image
			self.imageSize = 'large';
		} else if ( self.height <= 333 && self.height > 100 ) { // medium image
			self.imageSize = 'medium';
		} else { // small image
			self.imageSize = 'small';
		}

		// html for the glyph to be populated into the number slot
		var glyphHtml = '<div class="lost-timer-glyph-' + glyphColor + '-bg">'+
			'<img class="lost-flipper-hg-img" src="assets/glyphs/h' + glyphNumber + '-' + glyphColor + '-' + self.imageSize + '.png" />' +
		'</div>';

		return glyphHtml;
	};

	/**
	 * Stop glyphs from randomly spinning
	 *
	 * @return void
	 */
	lostTimer.prototype.stopGlyphs=function() {
		console.log( 'stopping glyphs' );
		// get self
		var self = this;

		// clear every flip interval that is spinning a card
		$.each( self.glyphIntervals || {}, function( key, intervalId ) {
			clearInterval( intervalId );
		} );

		// clear every timeout used to lock cards in or switch their colors
		$.each( self.glyphTimeouts || {}, function( key, timeoutId ) {
			clearTimeout( timeoutId );
		} );

		// stop every slot's fold chain
		self.spinning = {};

		// reset the trackers and the color switch timeout
		self.glyphIntervals = {};
		self.glyphTimeouts = {};
		clearTimeout( self.glyphColorTimeout );

		// stop the fast split-flap flip and clear the motion blur
		$( self.containerClassCss + ' .lost-flipper' ).removeClass( 'lost-flipper-spin lost-flipper-blur' );

		// clear any half finished flip transforms
		$( self.containerClassCss + ' .lost-flipper-next' ).removeClass( 'lost-flipper-next-active' );
		$( self.containerClassCss + ' .lost-flipper-next .lost-flipper-number-after' ).removeClass( 'lost-flipper-next-after-active' );
		$( self.containerClassCss + ' .lost-flipper-prev .lost-flipper-number-before' ).removeClass( 'lost-flipper-prev-before-active' );

		// restore each card to its original white/black number colors
		for ( var number = 1; number <= 5; number++ ) {
			$( self.containerClassCss + '-number-' + number )
				.removeClass( 'lost-flipper-bg-glyph-red lost-flipper-bg-glyph-black' )
				.addClass( number > 3 ? 'lost-flipper-bg-white' : 'lost-flipper-bg-black' );
		}
	};

	/**
	 * Roll glyphs by sending every card into a nonstop flip. Cards start by
	 * flipping their normal white/black number colors and switch midway to the
	 * red/black colors of the glyph each card is meant to end on, before locking
	 * in that final glyph at staggered times.
	 *
	 * @return void
	 */
	lostTimer.prototype.rollGlyphs = function() {
		// get self
		var self = this;

		// stop the timer
		clearInterval( self.timer );

		// play timeout sound
		self.playAudio( 'timeout' );

		// speed every card's split-flap flip way up and motion blur the folds for the fast roll
		$( self.containerClassCss + ' .lost-flipper' ).addClass( 'lost-flipper-spin lost-flipper-blur' );

		// track flip intervals/timeouts so they can all be cleared on reset
		self.glyphIntervals = {};
		self.glyphTimeouts = {};

		// fresh per slot history for the non-repeating random symbols
		self.recentSymbols = {};

		// per slot flag that keeps each slot's continuous fold chain going until it locks
		self.spinning = {};

		// time each number slot stops flipping and locks onto its final glyph
		var lockTimes = { 1: 10500, 2: 12000, 3: 7000, 4: 6000, 5: 8500 };

		// point in the spin when every card switches from its white/black number
		// colors over to the red/black colors of its final glyph
		var colorSwitchTime = 1200;

		for ( var number = 1; number <= 5; number++ ) { // start every card flipping
			( function( number ) {
				// kick off this slot's continuous split-flap fold chain
				self.spinning[number] = true;
				self.spinFlip( number );

				// lock this card onto its final glyph once its time is up
				self.glyphTimeouts[number] = setTimeout( function() {
					self.lockGlyph( number );
				}, lockTimes[number] );
			} )( number );
		}

		// midway through the spin flip every card over to its glyph colors
		self.glyphColorTimeout = setTimeout( function() {
			for ( var number = 1; number <= 5; number++ ) {
				self.setGlyphColors( number );
			}
		}, colorSwitchTime );
	};

	/**
	 * Flip a slot to a fresh random face using the realistic split-flap fold, then
	 * chain straight into the next fold so the spin folds continuously ( no idle gap )
	 * the way the countdown flip does, just at the faster rate. A random number while
	 * the slot is on its white/black colors, a random glyph once it is red/black.
	 *
	 * @params int number number slot to flip
	 *
	 * @return void
	 */
	lostTimer.prototype.spinFlip = function( number ) {
		// get self
		var self = this;

		if ( !self.spinning || !self.spinning[number] ) { // this slot has locked or the spin stopped
			return;
		}

		var flipperClassName = self.containerClassCss + '-number-' + number;

		// once a slot has switched to its glyph colors flip random glyphs, else random numbers
		var glyphPhase = $( flipperClassName ).hasClass( 'lost-flipper-bg-glyph-red' ) || $( flipperClassName ).hasClass( 'lost-flipper-bg-glyph-black' );

		var value;

		if ( glyphPhase ) { // random glyph image (1-5), avoiding the last couple shown
			value = self.getGlyphHtml( number, false, self.getRandomNonRepeating( number, 1, 5, 2 ) );
		} else { // random number (0-9), avoiding the last few shown
			value = self.getRandomNonRepeating( number, 0, 9, 4 );
		}

		// flip the real card, then immediately start the next fold when this one finishes
		self.flip( number, value, function() {
			self.spinFlip( number );
		} );
	};

	/**
	 * Switch a card from its white/black number colors over to the red/black
	 * colors of the glyph it is meant to end on.
	 *
	 * @params int number number slot to recolor
	 *
	 * @return void
	 */
	lostTimer.prototype.setGlyphColors = function( number ) {
		// get self
		var self = this;

		// glyph color matches getGlyphHtml: slots 1-3 are red glyphs, 4-5 are black
		var glyphColor = number > 3 ? 'black' : 'red';

		// swap the card off its white/black colors and onto its glyph colors
		$( self.containerClassCss + '-number-' + number )
			.removeClass( 'lost-flipper-bg-white lost-flipper-bg-black' )
			.addClass( 'lost-flipper-bg-glyph-' + glyphColor );

		// reset the symbol history so leftover digits don't skew the glyph picks
		if ( self.recentSymbols ) {
			self.recentSymbols[number] = [];
		}
	};

	/**
	 * Stop a card spinning and lock it onto its final glyph image.
	 *
	 * @params int number number slot to lock in
	 *
	 * @return void
	 */
	lostTimer.prototype.lockGlyph = function( number ) {
		// get self
		var self = this;

		// stop this slot's fold chain
		if ( self.spinning ) {
			self.spinning[number] = false;
		}

		// settle the card on its final glyph colors
		self.setGlyphColors( number );

		// stop the flip dead: cancel any in-flight fold and snap straight to the final glyph
		var flipperClassName = self.containerClassCss + '-number-' + number;
		$( flipperClassName ).removeClass( 'lost-flipper-blur' ); // land the glyph sharp, not blurred
		$( flipperClassName + ' .lost-flipper-prev .lost-flipper-number-before' ).off( 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend' );
		$( flipperClassName + ' .lost-flipper-next' ).removeClass( 'lost-flipper-next-active' );
		$( flipperClassName + ' .lost-flipper-next .lost-flipper-number-after' ).removeClass( 'lost-flipper-next-after-active' );
		$( flipperClassName + ' .lost-flipper-prev .lost-flipper-number-before' ).removeClass( 'lost-flipper-prev-before-active' );

		// show the final glyph across every face
		$( flipperClassName + ' .lost-flipper-number-table-cell' ).html( self.getGlyphHtml( number, false ) );

		if ( 2 == number ) { // the last card to settle kicks off the system failure
			self.systemFailure();
		}
	};

	/**
	 * System failure when the glyphs lock in place and the world starts ending
	 *
	 * @return void
	 */
	lostTimer.prototype.systemFailure = function() {
		// get self
		var self = this;

		// play spinup and dischard sounds
		self.playAudio( 'spinup' );
		self.playAudio( 'discharge' );
		
		self.systemFailureInterval = setInterval( function () { // play system failure every second
			self.playAudio( 'systemfailure' );

			// make the body shake
			$( 'body' ).addClass( 'lost-timer-shake' );
		}, 1000 );

		self.systemFailureTimout = setTimeout( function() { // stop system failure sound after 36 seconds
			clearInterval( self.systemFailureInterval );

			// make the body sstop hake
			$( 'body' ).removeClass( 'lost-timer-shake' );
		}, 36000 );

		self.thudTimeout = setTimeout( function() { //  play lost thud after 46 seconds game over
			// show and fade in white screen
			$( '.lost-timer-end-screen' ).show();
			$( '.lost-timer-end-screen' ).animate( { opacity: 1 }, 500 );

			self.playAudio( 'thud' );
		}, 46000 );
	};

	/**
	 * Reset the timer to the initial seconds
	 *
	 * @return int
	 */
	lostTimer.prototype.reset = function() {
		// get self
		var self = this;
		
		$( self.containerClassCss + ' audio' ).each( function() { // loop over all audio
			// pause track and reset its time to the beginning
		    this.pause();
		    this.currentTime = 0;
		} ); 

		// clear intervals timer and system failure
		clearInterval( self.systemFailureInterval );
		clearInterval( self.timer );

		// clear timeouts system failure and thud
		clearTimeout( self.systemFailureTimout );
		clearTimeout( self.thudTimeout );

		// play flipping reset sound
		self.playAudio( 'reset' );

		// make the body stop hake
		$( 'body' ).removeClass( 'lost-timer-shake' );

		// hide white end screen
		$( '.lost-timer-end-screen' ).hide();
		$( '.lost-timer-end-screen' ).css( 'opacity', 0 );

		// stop all glyphs
		self.stopGlyphs();

		// count times we play reset animation
		var count = 0;
		
		resetAnimate = setInterval( function () { // randomly display number in each spot until reset sound is complete
			// update the number slots html
			self.updateNumbers( true );

			if ( ++count > 10 ) { // after 10 times stop reset initialize and start timer
	            clearInterval( resetAnimate );
	            self.initializeTimer( self.initialSeconds );
            	self.startTimer();
	        }
		}, 120 );
    };

	// return it
	return lostTimer;
} )();