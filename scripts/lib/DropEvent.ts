/**
 * @license MIT
 * @version 1.0.0
 * Supported Minecraft version
 * @version 1.20.40
 * @author @Nano191225
 */

import * as Minecraft from "@minecraft/server";

const { world, system } = Minecraft;

const callbacks = new Map<(callback: PlayerItemDropAfterEvent) => void, boolean>();
const playerInventories = new Map<string, itemCompact[]>();

export default class playerItemDropAfterEvent {
    private callback: (arg: PlayerItemDropAfterEvent) => void = () => {};
    constructor(callback: (arg: PlayerItemDropAfterEvent) => void) {
        this.callback = callback;
        callbacks.set(this.callback, true);
    }

    public static subscribe(callback: (arg: PlayerItemDropAfterEvent) => void) {
        new playerItemDropAfterEvent(callback);
    }

    public static unsubscribe(callback: (arg: PlayerItemDropAfterEvent) => void) {
        callbacks.delete(callback);
    }
};

world.afterEvents.entitySpawn.subscribe(entitySpawn => {
    const { entity } = entitySpawn;
    if (entity.typeId !== "minecraft:item") return;

    const player = entity.dimension.getPlayers({ location: entity.location, minDistance: 0, maxDistance: 2})[0];
    if (!player) return;

    const container: Minecraft.Container = (player.getComponent("minecraft:inventory") as any).container;
    if (!container) return;

    const itemStack: Minecraft.ItemStack = (entity.getComponent("item") as any).itemStack;
    if (!itemStack) return;

    const returnFunction = () => {
        entity.kill();
        const playerInventory = playerInventories.get(player.id) ?? [];
        const inventoryItems = playerInventory.filter((item, i) => item.typeId === itemStack.typeId && (container.getItem(i)?.amount??0) + itemStack.amount === item.amount);
        if (inventoryItems.length === 1) {
            const inventoryItem = inventoryItems[0];
            const inventoryItemIndex = playerInventory.indexOf(inventoryItem);
            const inventoryItemStack = container.getItem(inventoryItemIndex);
            if (inventoryItemStack) {
                inventoryItemStack.amount += itemStack.amount;
                container.setItem(inventoryItemIndex, inventoryItemStack);    
            } else container.setItem(inventoryItemIndex, itemStack);
        } else {
            container.addItem(itemStack);
        }
    };

    const event: PlayerItemDropAfterEvent = {
        player,
        itemStack,
        dimension: entity.dimension,
        return: returnFunction
    };

    callbacks.forEach((_, callback) => callback(event));
});

system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        const container: Minecraft.Container = (player.getComponent("minecraft:inventory") as any).container;
        if (!container) return;

        for (let i = 0; i < container.size; i++) {
            const itemStack = container.getItem(i) ?? {typeId: "minecraft:air", amount: 0, maxAmount: 0};

            const itemStackType = itemStack.typeId;
            if (!itemStackType) continue;

            const playerInventory = playerInventories.get(player.id) ?? [];
            playerInventory[i] = {
                typeId: itemStackType,
                amount: itemStack.amount,
                maxAmount: itemStack.maxAmount
            };
            system.run(() => playerInventories.set(player.id, playerInventory));
        }
    });
});

world.afterEvents.playerJoin.subscribe(playerJoin => {
    const { playerId } = playerJoin;
    playerInventories.set(playerId, []);
});

world.afterEvents.playerLeave.subscribe(playerLeave => {
    const { playerId } = playerLeave;
    playerInventories.delete(playerId);
});

interface PlayerItemDropAfterEvent {
    player: Minecraft.Player;
    itemStack: Minecraft.ItemStack;
    dimension: Minecraft.Dimension;
    return: () => void;
}

interface itemCompact {
    typeId: string;
    amount: number;
    maxAmount: number;
}