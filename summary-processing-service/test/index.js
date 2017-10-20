// npm packages
const fs = require('fs');
const path = require('path');
const test = require('tap');
const Microwork = require('microwork');

// our packages
const startService = require('../src');
const config = require('../config');

// define rmq configs
const queueConfig = {durable: true, autoDelete: false};
const sendConfig = {persistent: true};

// test data
const inputData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'fixtures', 'input-article.json')).toString()
);

// main tests
test.test('# Summary generation processing service', it => {
  let cleanup = () => {};
  let testMaster;

  it.test('Should start service', t => {
    (async () => {
      cleanup = await startService();
      testMaster = new Microwork({host: 'localhost', exchange: 'datascience'});
      t.end();
    })();
  });

  it.test('Should process simple article', t => {
    (async () => {
      // listen for reply from workers
      await testMaster.subscribe(
        'update',
        data => {
          t.equal(data._id, inputData._id, 'Has correct id');
          t.ok(data.summary, 'Has summary text');
          t.equal(
            data.summary,
            `\nThe build is largely representative of the Day One experience of the game, but the review may be updated should an aspect being discussed change to any dramatic degree during the launch period.\nThe build is largely representative of the Day One experience of the game, but the review may be updated should an aspect being discussed change to any dramatic degree during the launch period.\nIt’s a game that has no doubts as to what it wants to be, and has largely delivered a gameplay experience with the fervor that it deserves.\nAfter taking the Tower out of commission, Ghaul usurps the energy of the Traveler, the haunting planet-sized entity looming over Earth’s last safe city, leaving all of our planet’s Guardians without their phenomenal powers, and the player feebly staggering out of the city and into the wild, forced to eke out some measure of a resistance against the invaders from a farmland bivouac in the middle of Europe.\nEven The Taken King expansion left the Books of Sorrow—the best sci-fi storytelling in the series thus far—as an obscure collectable.\nA few early missions do entertain the notion of a world where Destiny’s Guardians are mere mortals—a brief, lonely period where you limp across the countryside, hunted by rabid animals and with no way of resurrecting yourself if you die.\nAgain, clarity is the name of the game.\nThe first game gave the illusion of freedom, only to constantly wall itself off from players feeling truly free.\nThe rewards are immediate and, generally, resolution to every little narrative thread can be chased down with the tenacity it deserves.\nIn its place are more cutscenes showing the first game’s Speaker being brutally interrogated by Ghaul, dream-like sequences in forests that relate affecting little tales about the history of each Guardian subclass before players are given their new powers, exploratory missions that show us what the Red Legion has done to the worlds they’ve invaded.\nAll of this would fall apart without the kinetic core gameplay, which is the one thing Bungie got unquestionably right from minute one.\nTo look at any new Destiny content from the outset is to essentially examine a foundation upon which one hopes Bungie can build cathedrals to white-knuckle, space-operatic heroism.`,
            'Has correct summary'
          );
          t.end();
        },
        queueConfig
      );
      // send message to workers
      await testMaster.send(config.ID, inputData, sendConfig);
    })();
  });

  it.test('Should not fail to process broken article', t => {
    (async () => {
      // send message to workers
      await testMaster.send(config.ID, 'asd');
      t.end();
    })();
  });

  it.test('Should cleanup', t => {
    cleanup();
    testMaster.stop();
    t.end();
  });

  it.end();
});
