import React from "react";
import { ActivityIndicator } from "react-native-paper";

export const Spinner = ({ theme }) => (
		<ActivityIndicator animating={true} color={theme.colors.onSurfaceDisabled} />
);
