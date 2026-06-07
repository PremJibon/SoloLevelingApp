import { useSystemStore } from "../store/useSystemStore";

// Reset store before each test
beforeEach(() => {
  useSystemStore.getState().resetStore();
});

describe("Stats System", () => {
  it("should initialize with 10 in each stat", () => {
    const { stats } = useSystemStore.getState();
    expect(stats.strength).toBe(10);
    expect(stats.agility).toBe(10);
    expect(stats.sense).toBe(10);
    expect(stats.intelligence).toBe(10);
    expect(stats.vitality).toBe(10);
  });

  it("should allocate a stat point and decrement statPoints", () => {
    const { allocateStat, statPoints, stats } = useSystemStore.getState();
    const initialStats = { ...stats };
    const initialPoints = statPoints;
    useSystemStore.getState().allocateStat("strength");
    const newState = useSystemStore.getState();
    expect(newState.stats.strength).toBe(initialStats.strength + 1);
    expect(newState.statPoints).toBe(initialPoints - 1);
  });

  it("should not allocate if no stat points remain", () => {
    const state = useSystemStore.getState();
    for (let i = 0; i < state.statPoints; i++) {
      state.allocateStat("strength");
    }
    const beforeAllocate = useSystemStore.getState().stats.strength;
    useSystemStore.getState().allocateStat("strength");
    expect(useSystemStore.getState().stats.strength).toBe(beforeAllocate);
  });
});

describe("XP & Leveling", () => {
  it("should start at level 1 with 0 XP", () => {
    const { level, xp } = useSystemStore.getState();
    expect(level).toBe(1);
    expect(xp).toBe(0);
  });

  it("should gain XP and level up", () => {
    const { gainXp, maxXp } = useSystemStore.getState();
    gainXp(maxXp);
    const newState = useSystemStore.getState();
    expect(newState.level).toBe(2);
    expect(newState.statPoints).toBeGreaterThan(5);
  });

  it("should scale maxXp after each level up", () => {
    const state = useSystemStore.getState();
    state.gainXp(state.maxXp);
    expect(useSystemStore.getState().maxXp).toBe(125);
  });

  it("should award 5 stat points per level up", () => {
    const { gainXp, maxXp, statPoints } = useSystemStore.getState();
    gainXp(maxXp);
    expect(useSystemStore.getState().statPoints).toBe(statPoints + 5);
  });

  it("should award starter items at level 10", () => {
    useSystemStore.getState().devSetLevel(10);
    expect(useSystemStore.getState().inventory.length).toBeGreaterThan(0);
  });
});

describe("Player Name", () => {
  it("should set and trim player name", () => {
    useSystemStore.getState().setPlayerName("  Sung Jin-Woo  ");
    expect(useSystemStore.getState().playerName).toBe("Sung Jin-Woo");
  });
});

describe("Quest System", () => {
  it("should initialize with 4 quests", () => {
    expect(useSystemStore.getState().quests.length).toBe(4);
  });

  it("should update quest progress", () => {
    useSystemStore.getState().updateQuestProgress(1, 50);
    expect(useSystemStore.getState().quests[0].current).toBe(50);
  });

  it("should clamp quest progress to target", () => {
    useSystemStore.getState().updateQuestProgress(1, 200);
    expect(useSystemStore.getState().quests[0].current).toBe(100);
  });

  it("should clamp negative progress to 0", () => {
    useSystemStore.getState().updateQuestProgress(1, -10);
    expect(useSystemStore.getState().quests[0].current).toBe(0);
  });

  it("should mark all quests completed when targets met", () => {
    const { quests, updateQuestProgress } = useSystemStore.getState();
    quests.forEach((q) => updateQuestProgress(q.id, q.target));
    expect(useSystemStore.getState().questsCompletedToday).toBe(true);
  });

  it("should award gold on completion", () => {
    const initialGold = useSystemStore.getState().gold;
    useSystemStore.getState().updateQuestProgress(1, 100);
    expect(useSystemStore.getState().gold).toBe(initialGold + 100);
  });
});

describe("Economy", () => {
  it("should start with 500 gold", () => {
    expect(useSystemStore.getState().gold).toBe(500);
  });

  it("should gain gold", () => {
    useSystemStore.getState().gainGold(100);
    expect(useSystemStore.getState().gold).toBe(600);
  });
});

describe("Job System", () => {
  it("should start with NONE job", () => {
    expect(useSystemStore.getState().job).toBe("NONE");
  });

  it("should select a job", () => {
    useSystemStore.getState().selectJob("Shadow Monarch");
    expect(useSystemStore.getState().job).toBe("Shadow Monarch");
  });

  it("should add job bonus stats", () => {
    const before = useSystemStore.getState().stats.intelligence;
    useSystemStore.getState().addJobBonusStats({ intelligence: 10 });
    expect(useSystemStore.getState().stats.intelligence).toBe(before + 10);
  });
});

describe("Reset", () => {
  it("should reset all state to initial values", () => {
    useSystemStore.getState().gainXp(100);
    useSystemStore.getState().setPlayerName("Test");
    useSystemStore.getState().gainGold(1000);
    useSystemStore.getState().resetStore();
    const state = useSystemStore.getState();
    expect(state.level).toBe(1);
    expect(state.xp).toBe(0);
    expect(state.playerName).toBe("");
    expect(state.gold).toBe(500);
    expect(state.job).toBe("NONE");
  });
});
