
export type GoalTransferMode = 'add_to_goal' | 'take_from_goal' | 'transfer_between_goals';

export interface GoalTransferConfig {
  mode: GoalTransferMode;
  goalId: number;
  goalName: string;
}

export const getTransferModeConfig = (mode: GoalTransferMode) => {
  switch (mode) {
    case 'add_to_goal':
      return {
        title: 'Tambah ke Goal',
        description: 'Transfer dana ke goal ini',
        showFromGoal: false,
        showFromInstrument: false,
        showFromAsset: false,
        showToGoal: false,
        showToInstrument: true,
        showToAsset: true,
        prefilledField: 'to_goal_id' as const,
      };
    case 'take_from_goal':
      return {
        title: 'Ambil dari Goal',
        description: 'Transfer dana dari goal ini',
        showFromGoal: false,
        showFromInstrument: true,
        showFromAsset: true,
        showToGoal: false,
        showToInstrument: false,
        showToAsset: false,
        prefilledField: 'from_goal_id' as const,
      };
    case 'transfer_between_goals':
      return {
        title: 'Pindahkan ke Goal Lain',
        description: 'Transfer dana antar goal',
        showFromGoal: false,
        showFromInstrument: true,
        showFromAsset: true,
        showToGoal: true,
        showToInstrument: true,
        showToAsset: true,
        prefilledField: 'from_goal_id' as const,
      };
  }
};
