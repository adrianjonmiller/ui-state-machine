import UiStateMachine from '../src';

test('getCurrentState', () => {
  let states = {
    'start': {}
  }

  let uiStateMachine = new UiStateMachine(states, 'start').init();
  expect(uiStateMachine.getState()).toBe('start');
});


test('getNextState', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      }
    },
    'nextState': {}
  };

  let uiStateMachine = new UiStateMachine(states, 'start').init();

  uiStateMachine.emit('SUCCESS');

  expect(uiStateMachine.getState()).toBe('nextState');
});


test('getEvents', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      }
    },
    'nextState': {}
  };

  let uiStateMachine = new UiStateMachine(states, 'start').init();
  let events = uiStateMachine.getEvents();

  expect(events[0]).toBe('SUCCESS');
});

test('leavingState', done => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
      leave: () => {
        done()
      }
    },
    'nextState': {}
  };

  let uiStateMachine = new UiStateMachine(states, 'start').init();

  uiStateMachine.emit('SUCCESS');
});


test('enteringState', done => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
    },
    'nextState': {
      enter: () => {
        done()
      }
    }
  };
  let uiStateMachine = new UiStateMachine(states, 'start').init();

  uiStateMachine.emit('SUCCESS');
});

test('receivePayload', done => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      }
    },
    'nextState': {}
  };

  let uiStateMachine = new UiStateMachine(states, 'start').init();

  uiStateMachine.onStateChange((_, __, ____, payload) => {
    if (payload.name === 'test') {
      done()
    }
  })

  uiStateMachine.emit('SUCCESS', {name: 'test'});
});


test('getData', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
    },
    'nextState': {
      data: 'success'
    }
  };

  let uiStateMachine = new UiStateMachine(states, 'start').init();

  uiStateMachine.emit('SUCCESS');

  expect(uiStateMachine.getData()).toBe('success');
});

test('onStateChange', done => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
    },
    'nextState': {
      data: 'success'
    }
  };

  let uiStateMachine = new UiStateMachine(states, 'start').init();

  uiStateMachine.onStateChange(() => done());

  uiStateMachine.emit('SUCCESS');
});


test('prevState', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
    },
    'nextState': {
      data: 'success'
    }
  };

  let uiStateMachine = new UiStateMachine(states, 'start').init();

  uiStateMachine.emit('SUCCESS');

  uiStateMachine.goToPrevState();

  expect(uiStateMachine.getState()).toBe('start');
});

test('stateGuard', () => {
  let states = {
    'start': {
      on: {
        'SUCCESS': 'nextState'
      },
    },
    'nextState': {
      data: 'success'
    }
  };

  let uiStateMachine = new UiStateMachine(states, 'start').init();

  uiStateMachine.beforeEach((to, from, next) => {
    if (to === 'nextState' && from === 'start') {
      next()
    }
  });

  uiStateMachine.emit('SUCCESS');

  expect(uiStateMachine.getState()).toBe('nextState')
});


test('Jump to state', () => {
  let states = {
    'start': {},
    "next": {}
  }

  let uiStateMachine = new UiStateMachine(states, 'start').init();
  expect(uiStateMachine.jumpTo('next').getState()).toBe('next');
});