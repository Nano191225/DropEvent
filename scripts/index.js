import * as Minecraft from '@minecraft/server';
import playerItemDropAfterEvent from './lib/DropEvent.js';
const { world, system } = Minecraft;
playerItemDropAfterEvent.subscribe(event => {
    const { player, itemStack, dimension } = event;
    player.sendMessage(`You dropped ${itemStack.amount} ${itemStack.typeId}!`);
    event.return();
});
