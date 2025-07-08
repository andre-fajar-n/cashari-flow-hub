export interface InstrumentFormData {
  name: string;
  unit_label: string;
  is_trackable: boolean;
}

export const defaultInstrumentFormValues: InstrumentFormData = {
  name: "",
  unit_label: "",
  is_trackable: true,
};
