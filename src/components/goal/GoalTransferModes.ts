export type GoalTransferMode = 'add_to_goal' | 'take_from_goal' | 'transfer_between_goals' | 'transfer_with_same_goals';

export interface GoalTransferConfig {
  mode: GoalTransferMode;
  goalId: number;
}

export const getTransferModeConfig = (mode: GoalTransferMode) => {
  switch (mode) {
    case 'add_to_goal':
      return {
        mode: mode,
        title: 'Tambah ke Goal',
        description: 'Transfer dana ke goal ini',
        showFromGoal: false,
        showFromInstrument: false,
        showFromAsset: false,
        showToGoal: false,
        showToInstrument: true,
        showToAsset: true,
      };
    case 'take_from_goal':
      return {
        mode: mode,
        title: 'Ambil dari Goal',
        description: 'Ambil dana dari goal ini',
        showFromGoal: false,
        showFromInstrument: true,
        showFromAsset: true,
        showToGoal: false,
        showToInstrument: false,
        showToAsset: false,
      };
    case 'transfer_between_goals':
      return {
        mode: mode,
        title: 'Pindahkan ke Goal Lain',
        description: 'Transfer dana antar goal',
        showFromGoal: false,
        showFromInstrument: true,
        showFromAsset: true,
        showToGoal: true,
        showToInstrument: true,
        showToAsset: true,
      };
    case 'transfer_with_same_goals':
      return {
        mode: mode,
        title: 'Pindahkan ke Instrumen/Aset Lain',
        description: 'Transfer dana antar instrumen/aset',
        showFromGoal: false,
        showFromInstrument: true,
        showFromAsset: true,
        showToGoal: false,
        showToInstrument: true,
        showToAsset: true,
      };
  }
};
