# DropEvent

ScriptAPIにドロップイベントを追加するライブラリ

```ts
import playerItemDropAfterEvent from 'path/to/DropEvent.js';

// ドロップイベントを登録
playerItemDropAfterEvent.subscribe((event) => {
    // ドロップしたプレイヤー
    event.player: Minecraft.Player;
    // ドロップしたアイテム
    event.itemStack: Minecraft.ItemStack;
    // ドロップしたディメンション
    event.dimension: Minecraft.Dimension;
    // ドロップしたアイテムをインベントリに戻す
    event.return: () => void;
});
```

> **Warning**: `return()` は完全に元の場所に戻せないことがあります。