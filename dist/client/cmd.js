"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cmdExecute = cmdExecute;
exports.cmdSetPrev = cmdSetPrev;
exports.focusCmd = focusCmd;
exports.initCmd = initCmd;
var _render = require("./render.js");
var _networking = require("./networking.js");
var cmd;
var cmdPrev = '';
var defaultCmdColor;
function initCmd() {
  (0, _render.setCmdLayer)();
  cmd = document.getElementById("cmd-input");
  defaultCmdColor = window.localStorage.getItem('defaultCmdColor') || 'yellow';
  (0, _render.setCmdColor)(defaultCmdColor);
  cmd.classList.remove("hidden");
}
function focusCmd() {
  cmd.focus();
}
function cmdSetPrev() {
  cmd.value = cmdPrev;
}
var command = '',
  options = [];
function cmdExecute() {
  cmdPrev = cmd.value;
  options = cmd.value.toLowerCase().split(' ');
  command = options.shift();
  (function () {
    if (command == '') {
      return;
    }
    log('');
    if (command == 'hi') {
      cmd_hi();
      return;
    }
    if (command == 'debug') {
      cmd_debug();
      return;
    }
    if (command == 'color') {
      cmd_color();
      return;
    }
    if (command == 'cmdlist') {
      cmd_cmdlist();
      return;
    }
    if (command == 'clear') {
      cmd_clear();
      return;
    }
    if (command == 'inv') {
      cmd_inv();
      return;
    }
    cmd_help();
  })();
  cmd.value = '';
  cmd.blur();
}
function log(str) {
  (0, _render.addCmdLog)(str);
}
function cmd_hi() {
  log('hello');
}
function cmd_debug() {
  if (options[0] == 'help' || !options[0]) {
    log('use "debug options" for a list of available options');
    log('use "debug help=<option>" to learn more about a specific option');
    log('use "debug [option]=<para>" to toggle/modify an option');
    log('only ONE option can be toggled at a time');
  } else if (options[0] == 'options') {
    log("showHitbox, showHP, showDir");
  } else {
    options[0] = options[0].split('=');
    if (options[0][0] == 'help') {
      if (options[0][1] == 'showhitbox') {
        log('usage: debug showHitbox=<on/off>');
        log('shows hitbox of all entities');
      } else if (options[0][1] == 'showhp') {
        log('usage: debug showHP=<on/off>');
        log('shows hp of all entities');
      } else if (options[0][1] == 'showdir') {
        log('usage: debug showDir=<on/off>');
        log('shows direction of all entities');
      } else {
        log('not an available option');
        log('use "debug options" for a list of available options');
      }
    } else if (options[0][0] == 'showhitbox') {
      // id: 0
      if (options[0][1] == 'on') {
        log('showHitbox enabled');
        (0, _render.toggleDebugOption)(0, true);
      } else if (options[0][1] == 'off') {
        log('showHitbox disabled');
        (0, _render.toggleDebugOption)(0, false);
      } else {
        log('invalid parameter');
      }
    } else if (options[0][0] == 'showhp') {
      // id: 1
      if (options[0][1] == 'on') {
        log('showHP enabled');
        (0, _render.toggleDebugOption)(1, true);
      } else if (options[0][1] == 'off') {
        log('showHP disabled');
        (0, _render.toggleDebugOption)(1, false);
      } else {
        log('invalid parameter');
      }
    } else if (options[0][0] == 'showdir') {
      // id: 2
      if (options[0][1] == 'on') {
        log('showDir enabled');
        (0, _render.toggleDebugOption)(2, true);
      } else if (options[0][1] == 'off') {
        log('showDir disabled');
        (0, _render.toggleDebugOption)(2, false);
      } else {
        log('invalid parameter');
      }
    } else {
      log('invalid usage');
    }
  }
}
function cmd_help() {
  log('common usage: "command [option_1]=<value_1> [option_2]=<value_2> ...",');
  log('"command action" or simply "command" if there\'s such usage');
  log('use "command help" for more information on a specific command');
  log('use "cmdlist" for a list of available commands');
  log('use the up arrow key to fill in the previous command');
  log('commands are NOT case sensitive');
}
function cmd_cmdlist() {
  log('available commands: hi, debug, color, cmdlist, clear, inv');
}
function cmd_color() {
  if (options[0] == 'help' || !options[0]) {
    log('use "color use=<color>" to change output color');
    log('use "color set=<color>" to set default output color');
    log('use "color default" to check default color');
    log('use "color list" for a list of available colors');
  } else if (options[0] == 'default') {
    log("default color is ".concat(defaultCmdColor));
  } else if (options[0] == 'list') {
    log("available colors: cyan, red, gray, black, white,");
    log("yellow, aquamarine, darkseagreen or default(".concat(defaultCmdColor, ")"));
  } else {
    options[0] = options[0].split('=');
    if (options[0][0] == 'use') {
      if (options[0][1] == 'default') {
        (0, _render.setCmdColor)(defaultCmdColor);
        log('color changed');
      } else if (['cyan', 'red', 'gray', 'black', 'white', 'yellow', 'aquamarine', 'darkseagreen'].includes(options[0][1])) {
        (0, _render.setCmdColor)(options[0][1]);
        log('color changed');
      } else {
        log('not an available color');
        log('use "color list" for a list of available colors');
      }
    } else if (options[0][0] == 'set') {
      if (options[0][1] == 'default') {
        log('Nope.');
      } else if (['cyan', 'red', 'gray', 'black', 'white', 'yellow', 'aquamarine', 'darkseagreen'].includes(options[0][1])) {
        defaultCmdColor = options[0][1];
        window.localStorage.setItem('defaultCmdColor', defaultCmdColor);
        log("default color has been set to ".concat(defaultCmdColor));
      } else {
        log('not an available color');
        log('use "color list" for a list of available colors');
      }
    } else {
      log('invalid usage');
    }
  }
}
function cmd_clear() {
  (0, _render.clearCmdLog)();
}
var invSet = new Set(),
  invPetal = '';
function cmd_inv() {
  if (options[0] == "help" || !options[0]) {
    log('use "inv sel=<row>,<colume> to select a slot');
    log('row/column number starts from 1');
    log('use "inv sel=-1 to deselect the selected slot(s)');
    log('use "inv del" to remove the petal in the selected slot(s)');
    log('use "inv set=<petal>" to set the petal in the selected slot(s)');
    log('use "inv check" to check selected slot(s)');
  } else if (options[0] == 'del') {
    invPetal = 'EMPTY';
    (0, _networking.sendCmdInv)(invSet, invPetal);
    // delete
  } else if (options[0] == 'check') {
    log();
  } else {
    options[0] = options[0].split('=');
    if (options[0][0] == 'sel') {
      if (options[0][1] == '-1') {
        invSet.clear();
      } else {
        options[0][1] = options[0][1].split(',');
        var r = options[0][1][0],
          c = options[0][1][1];
        if (!r || !c) {
          log('invalid parameters');
        } else {
          invSet.add({
            r: options[0][1][0],
            c: options[0][1][1]
          });
        }
      }
    } else if (options[0][0] == 'set') {
      invPetal = options[0][1];
      (0, _networking.sendCmdInv)(invSet, invPetal);
    } else {
      log('invalid usage');
    }
  }
}