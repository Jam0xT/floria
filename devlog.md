# $20230226$ $v0.1.0$
 - 完成了环境的搭建，有一个的极其简单而不平凡的初始界面。虽然写着READY却不让你READY的按钮。
# $20230227$ $v0.2.0$
 - 游戏本体完成。可以进入游戏并移动（多人游戏）
 - 背景是个临时的绿灰渐变背景。有一种我无法理解的抽象之美。代表着正在被污染的花园。
 - 玩家是没有表情的黄色小球，体现了玩家被困而无法离开的迷茫。
# $20230228$ $v0.3.0$
 - 修复了一些UI问题（开始界面和断开连接界面额外占位，页面有滚动条和边框）。
 ~~只是修复了这些问题，UI依然没有做好~~
 - 修复了界面缩放问题。
 - 现在速度（$speed$）由基本速度（$speedBase$）和速度加成（$speedRatio$）组成。
 $speed = speedBase \cdot speedRatio$
 - 现在随着鼠标和玩家的距离（$distnceMouseCenter$）会影响玩家移动速度加成。
 $speedRatio = \frac{min(200, distanceMouseCenter)}{200}$
 - 调整游戏地图。
 地图大小现在是$2700*2700$。
 地图现在由纯色背景和网格线组成，网格线间距为$45$。
# $20230301$ $v0.3.1$
 - 微调了地图背景网格线的宽度和颜色。
 - 调整了玩家的大小。
 现在玩家的半径是$22.5$，渲染半径是$24.5$。
# $20230301$ $v0.3.2$
 - 做了半个开始界面。
 ~~实际上应该连1/10都不到~~
 - 取消了开始游戏按钮，现在只要按下回车键就会开始游戏。
# $20230304$ $v0.4.0$
 - 删去了令人不忍直视的"$Connecting...$"文字动画。
 - 完成了一个简约的开始界面。
 - 在游戏内左上角加入了一个$florr.cn$的字样。
 - 现在输入是一个向量$input:(magnitude, direction)$
 $speedRatio = \frac{min(100, distanceMouseCenter)}{100}$。
 $input.magnitude = speedRatio \cdot playerSpeed$。
 现在鼠标和玩家距离为$100$时$input.magnitude$最大。更多请参考$v0.3.0$。
 - 玩家移动方式修改。现在玩家的移动由速度（$velocity$）和加速度（$acceleration$）决定。
 $player.acceleration = playerMass \cdot magnitude + playerAccelerationBias$
 其中$playerMass$和$playerAccelerationBias$是常数。
 每个游戏刻中，$player.velocity = min(player.velocity + player.acceleration, operativeVelocityUpperbound)$
 - 常数修改/添加。
 $playerSpeed = 250$
 $(+)playerMass = 5$
 $(+)playerAccelerationBias = 0$
# $20230304$ $v0.4.1$
 - 常数修改/添加。
 $playerSpeed = 225$
 $(+)hurtInterval = 10$
 $(+)playerBodyDamage = 5$
 $(+)playerCollisionKnockback = 150$
 - 调整游戏内左上角$florr.cn$字样浅色部分的颜色为$rgb(221, 239, 230)$。
 - 现在玩家上方会显示玩家用户名。
 - 现在玩家下方会显示玩家血量。
 - 现在死亡后会直接刷新界面。
 - 现在玩家可以碰撞，玩家的碰撞伤害为$5$。
 碰撞后参与碰撞的目标都会被击退。
 目前速度不会衰减。（没有摩擦力，被撞了之后做匀速直线运动）
 - 添加新常数$hurtInterval$，表示实体的伤害间隔，单位为$tick$。
 现在$1$秒有$60$游戏刻（$1 tick = \frac{1000}{60} millisecond = 0.0167 second$）
 - 给实体添加新属性$hurtTime$。
 当$hurtTime$为$-1$时表示没有受伤。
 否则表示目前距离上一次受伤已经过去了多少$tick$。
 - 为了方便测试
 玩家上方显示坐标和距离。
# $20230305$ $v0.4.2$
 - 把$Object$类分成了$ObjectMovable$和$ObjectImmovable$两类，都继承$Object$类。
 - 现在玩家的速度用一个由被动分速度组成的数列表示。
 一个被动分速度会按每$tick$变为原来的$(speedAttenuationCoeffcient\times 100\%)$的速度衰减。
 直到足够小（$magnitude < speedAttenuationBias$），然后被删除。
 主动分速度如果超出了当前的动力，也会按同样的速度衰减。
 - 删除了可动物体类的$setVelocity$方法，设置被动分速度可以更好的完成它原本想做的事情。
 - 删除了可动物体类的$acceleration$属性，因为现在会处理好速度直接用速度更新位置。
 - 增加键盘移动。按$RShift$开始游戏就会使用键盘移动。
 - 物理引擎已经初步完成（玩家移动和碰撞）。
 - 常数修改/添加。
 $(+)speedAttenuationCoefficient = 0.85$
 $(+)speedAttenuationBias = 10$
 $playerMass = 1$
 $playerSpeed = 30$
 $playerCollisionKnockback = 5000$
# $20230311$ $v0.4.3$
 - 添加了一个在标题旁边显示的图标。
 - 新增了一个存放所有生物属性的模块。
 - 把$ObjectImmovable$和$ObjectMovable$类删除，所有实体统一继承$Object$类。
 - 完成了计分板。
 - 进行了一些模块化。
 - 写了一些注释。
 - 常数修改/添加。
 $player.mass = 5$
 $player.speed = 225$
 $player.collisionKnockback = 750$
 $speedAttenuationCoefficient = 0.75$
 $leaderboardLength = 10$
 $(+)tickPerSecond = 60$
 $(-)playerAccelerationBias$
# $20230313$ $v0.5.0$
 - 进行了一些模块化处理。
 - 添加了一个彩蛋。
 <!-- 当玩家名为'Pop!'时会以泡泡的形式显示 -->
 - 更新了生物：泡泡。
 - 生物碰撞判定的实现：维护一个区块数组，里面存放每个区块里有哪些生物。
 每个生物会注册到所有该生物碰撞箱覆盖到的区块里。
 - 常数修改/添加不再详细记录到日志中。