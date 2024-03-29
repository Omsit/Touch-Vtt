import {wrapMethod} from '../utils/Injection'
import {MODULE_NAME} from '../config/ModuleConstants'
import {EASY_TARGET_OFF, EASY_TARGET_SETTING, EASY_TARGET_SINGLE} from '../config/TouchSettings'

export function initEasyTarget() {
  // The _handleClickLeft is now private in FoundryVTT v11.
  // This condition disables easy targeting for now until I find a solution how to override it.
  if (typeof MouseInteractionManager.prototype._handleClickLeft !== 'function') {
    return
  }

  wrapMethod('MouseInteractionManager.prototype._handleClickLeft', function (originalMethod, event, ...args) {
    const token = event.currentTarget
    if (isEasyTargetEnabled() && isSelectToolActive() && token instanceof Token && isUnownedToken(this, event)) {
      // The user usually cannot click this token => we'll select it
      targetToken(token)
    } else {
      return originalMethod.call(this, event, ...args)
    }
  }, 'MIXED')
}

function targetToken(token) {
  const releaseOthers = getSettingValue() === EASY_TARGET_SINGLE
  token.setTarget(!token.isTargeted, { releaseOthers })
}

function getSettingValue() {
  return game.settings.get(MODULE_NAME, EASY_TARGET_SETTING)
}

function isEasyTargetEnabled() {
  return getSettingValue() !== EASY_TARGET_OFF
}

function isSelectToolActive() {
  return game.activeTool === 'select'
}

function isUnownedToken(mouseInteractionManager, event) {
  return typeof mouseInteractionManager.can === 'function' && !mouseInteractionManager.can('clickLeft', event)
}
