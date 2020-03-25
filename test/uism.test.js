import UiStateMachine from '../src';


test('getCurrentState', () => {
  let states = {
    'start': {}
  }

  let uiStateMachine = new UiStateMachine(states, 'start')
  expect(uiStateMachine.getState()).toBe('start');
});


test('getNextState', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': {
          next: 'nextState'
        }
      }
    },
    'nextState': {}
  };
  let uiStateMachine = new UiStateMachine(states, 'start')
  uiStateMachine.on('SUCCESS');
  expect(uiStateMachine.getState()).toBe('nextState');
});

test('leavingState', done => {
  let states = {
    'start': {
      on: {
        'SUCCESS': {
          next: 'nextState'
        }
      },
      leave: () => {
        done()
      }
    },
    'nextState': {}
  };
  let uiStateMachine = new UiStateMachine(states, 'start')
  uiStateMachine.on('SUCCESS');
});


test('enteringState', done => {
  let states = {
    'start': {
      on: {
        'SUCCESS': {
          next: 'nextState'
        }
      },
    },
    'nextState': {
      enter: () => {
        done()
      }
    }
  };
  let uiStateMachine = new UiStateMachine(states, 'start')
  uiStateMachine.on('SUCCESS');
});


test('getPayload', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': {
          next: 'nextState'
        }
      },
    },
    'nextState': {
      payload: 'success'
    }
  };
  let uiStateMachine = new UiStateMachine(states, 'start')
  uiStateMachine.on('SUCCESS');
  expect(uiStateMachine.getPayload()).toBe('success')
});

test('onStateChange', done => {
  let states = {
    'start': {
      on: {
        'SUCCESS': {
          next: 'nextState'
        }
      },
    },
    'nextState': {
      payload: 'success'
    }
  };
  let uiStateMachine = new UiStateMachine(states, 'start');
  uiStateMachine.onStateChange(() => done())
  uiStateMachine.on('SUCCESS');
});


test('prevState', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': {
          next: 'nextState'
        }
      },
    },
    'nextState': {
      payload: 'success'
    }
  };
  let uiStateMachine = new UiStateMachine(states, 'start');
  uiStateMachine.on('SUCCESS');
  uiStateMachine.goToPrevState();
  expect(uiStateMachine.getState()).toBe('start');
});