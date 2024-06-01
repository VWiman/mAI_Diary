import React from "react";
import { ActivityIndicator } from "react-native-paper";

// Spinner now expects a 'theme' prop
export const Spinner = ({ theme }) => (
		<ActivityIndicator animating={true} color={theme.colors.onSurfaceDisabled} />
);
