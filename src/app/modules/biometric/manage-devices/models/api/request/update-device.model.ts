import type { CreateBiometricDevice } from "./create-device.model";

export interface UpdateBiometricDevice extends CreateBiometricDevice {
  id: string;
}
