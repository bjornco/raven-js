/**
 * console plugin
 *
 * Monkey patches console.* calls into Sentry messages with
 * their appropriate log levels. (Experimental)
 */
'use strict';

function consolePlugin(Raven, console) {
    console = console || window.console || {};

    var originalConsole = console,
        logLevels = ['debug', 'info', 'warn', 'error'],
        level = logLevels.pop();

    var logForGivenLevel = function(l) {
        var originalConsoleLevel = console[l];

        // warning level is the only level that doesn't map up
        // correctly with what Sentry expects.
        if (level === 'warn') level = 'warning';
        return function () {
            var args = [].slice.call(arguments);
            Raven.captureMessage('' + args[0], {level: level, logger: 'console', extra: { 'arguments': args }});

            // this fails for some browsers. :(
            if (originalConsoleLevel) {
                // IE9 doesn't allow calling apply on console functions directly
                // See: https://stackoverflow.com/questions/5472938/does-ie9-support-console-log-and-is-it-a-real-function#answer-5473193
                Function.prototype.bind
                    .call(originalConsoleLevel, originalConsole)
                    .apply(originalConsole, args);
            }
        };
    };


    while(level) {
        console[level] = logForGivenLevel(level);
        level = logLevels.pop();
    }
}

module.exports = consolePlugin;
