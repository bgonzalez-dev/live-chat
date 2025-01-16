import { client, xml, jid } from '@xmpp/client';
import debug from '@xmpp/debug';
import 'isomorphic-fetch';

let xmpp;
let onMessageCallback;
let onPresenceCallback;
let onRosterCallback;

export function setupXMPP(username, password, onMessage, onPresence, onRoster) {
  const domain = 'ec2-184-73-137-109.compute-1.amazonaws.com';
  xmpp = client({
    service: `ws://${domain}:7070/ws`,
    domain: domain,
    resource: 'web',
    username: username,
    password: password,
    transports: {
      websocket: `ws://${domain}:7070/ws`,
      bosh: `http://${domain}:7070/http-bind`,
    }
  });

  debug(xmpp, true);

  xmpp.on('online', async (address) => {
    console.log('Connected as', address.toString());

    // Request roster
    const rosterIq = xml(
        'iq',
        { type: 'get', id: 'roster1' },
        xml('query', { xmlns: 'jabber:iq:roster' })
    );
    const rosterResult = await xmpp.iqCaller.request(rosterIq);
    const roster = parseRoster(rosterResult);
    if (onRosterCallback) onRosterCallback(roster);

    // Send initial presence with priority
    await sendPresence();

    // Subscribe to presence for all roster items
    roster.forEach(item => {
      xmpp.send(xml('presence', { to: item.jid, type: 'subscribe' }));
      requestPresence(item.jid);
    });
  });

  xmpp.on('error', (err) => {
    console.error('XMPP error:', err.toString());
  });

  xmpp.on('stanza', async (stanza) => {
    if (stanza.is('message') && stanza.attrs.type === 'chat') {
      const message = {
        from: jid(stanza.attrs.from).bare().toString(),
        body: stanza.getChildText('body'),
        timestamp: new Date().toISOString(),
      };
      if (onMessageCallback) onMessageCallback(message);
    } else if (stanza.is('presence')) {
      const from = jid(stanza.attrs.from).bare().toString();
      const type = stanza.attrs.type || 'available';
      const show = stanza.getChildText('show') || 'chat';
      const status = stanza.getChildText('status') || 'Online';

      // Auto-accept subscription requests
      if (type === 'subscribe') {
        xmpp.send(xml('presence', { to: from, type: 'subscribed' }));
        xmpp.send(xml('presence', { to: from, type: 'subscribe' }));
      }

      // Handle presence updates
      if (!type || type === 'available' || type === 'unavailable') {
        const presence = {
          from,
          type,
          show,
          status,
          timestamp: new Date().toISOString()
        };
        if (onPresenceCallback) onPresenceCallback(presence);
      }
    }
  });

  onMessageCallback = onMessage;
  onPresenceCallback = onPresence;
  onRosterCallback = onRoster;

  xmpp.start().catch(console.error);
}

export function sendMessage(to, body, file = null) {
  if (xmpp) {
    const message = xml(
        'message',
        { type: 'chat', to },
        xml('body', {}, body)
    );

    if (file) {
      const fileTransfer = xml(
          'x',
          { xmlns: 'jabber:x:oob' },
          xml('url', {}, file.url),
          xml('desc', {}, file.name)
      );
      message.append(fileTransfer);
    }

    xmpp.send(message);
  } else {
    console.error('XMPP client not initialized');
  }
}

export function sendPresence(show = 'chat', status = 'Online') {
  if (xmpp) {
    const presence = xml(
        'presence',
        {},
        xml('priority', {}, '10'),
        xml('show', {}, show),
        xml('status', {}, status)
    );
    xmpp.send(presence);
  } else {
    console.error('XMPP client not initialized');
  }
}

export function requestPresence(jid) {
  if (xmpp) {
    xmpp.send(xml('presence', { to: jid, type: 'probe' }));
  } else {
    console.error('XMPP client not initialized');
  }
}

export function addContact(jid) {
  if (xmpp) {
    const iq = xml(
        'iq',
        { type: 'set' },
        xml(
            'query',
            { xmlns: 'jabber:iq:roster' },
            xml('item', { jid })
        )
    );
    xmpp.send(iq);
    xmpp.send(xml('presence', { to: jid, type: 'subscribe' }));
    requestPresence(jid);
  } else {
    console.error('XMPP client not initialized');
  }
}

export function removeContact(jid) {
  if (xmpp) {
    const iq = xml(
        'iq',
        { type: 'set' },
        xml(
            'query',
            { xmlns: 'jabber:iq:roster' },
            xml('item', { jid, subscription: 'remove' })
        )
    );
    xmpp.send(iq);
    xmpp.send(xml('presence', { to: jid, type: 'unsubscribe' }));
  } else {
    console.error('XMPP client not initialized');
  }
}

function parseRoster(iq) {
  const result = [];
  const items = iq.getChild('query').getChildren('item');
  for (const item of items) {
    result.push({
      jid: item.attrs.jid,
      name: item.attrs.name || item.attrs.jid.split('@')[0],
      subscription: item.attrs.subscription,
    });
  }
  return result;
}

