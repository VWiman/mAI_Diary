import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { MD3LightTheme as DefaultTheme, PaperProvider } from "react-native-paper";
import { User } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
	apiKey: "AIzaSyAg7vWyDCLh4deh6i5R6z4BP6PzyqliP7U",
	authDomain: "diary-14de3.firebaseapp.com",
	projectId: "diary-14de3",
	storageBucket: "diary-14de3.appspot.com",
	messagingSenderId: "801876101851",
	appId: "1:801876101851:web:810c81e0e3fe85c1421afe",
	measurementId: "G-B073YKH1Q0",
};

const app = initializeApp(firebaseConfig);
initializeAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const theme = {
	...DefaultTheme,
	colors: {
		primary: "rgb(0, 103, 130)",
		onPrimary: "rgb(255, 255, 255)",
		primaryContainer: "rgb(187, 233, 255)",
		onPrimaryContainer: "rgb(0, 31, 41)",
		secondary: "rgb(76, 97, 107)",
		onSecondary: "rgb(255, 255, 255)",
		secondaryContainer: "rgb(207, 230, 242)",
		onSecondaryContainer: "rgb(8, 30, 38)",
		tertiary: "rgb(92, 91, 125)",
		onTertiary: "rgb(255, 255, 255)",
		tertiaryContainer: "rgb(226, 223, 255)",
		onTertiaryContainer: "rgb(25, 24, 55)",
		error: "rgb(186, 26, 26)",
		onError: "rgb(255, 255, 255)",
		errorContainer: "rgb(255, 218, 214)",
		onErrorContainer: "rgb(65, 0, 2)",
		background: "rgb(251, 252, 254)",
		onBackground: "rgb(25, 28, 30)",
		surface: "rgb(251, 252, 254)",
		onSurface: "rgb(25, 28, 30)",
		surfaceVariant: "rgb(220, 228, 233)",
		onSurfaceVariant: "rgb(64, 72, 76)",
		outline: "rgb(112, 120, 125)",
		outlineVariant: "rgb(192, 200, 204)",
		shadow: "rgb(0, 0, 0)",
		scrim: "rgb(0, 0, 0)",
		inverseSurface: "rgb(46, 49, 50)",
		inverseOnSurface: "rgb(239, 241, 243)",
		inversePrimary: "rgb(97, 212, 255)",
		elevation: {
			level0: "transparent",
			level1: "rgb(238, 245, 248)",
			level2: "rgb(231, 240, 244)",
			level3: "rgb(223, 236, 240)",
			level4: "rgb(221, 234, 239)",
			level5: "rgb(216, 231, 237)",
		},
		surfaceDisabled: "rgba(25, 28, 30, 0.12)",
		onSurfaceDisabled: "rgba(25, 28, 30, 0.38)",
		backdrop: "rgba(42, 50, 53, 0.4)",
	},
};

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
}

function RootLayoutNav() {
	return (
		<PaperProvider theme={theme}>
			<Stack screenOptions={{ headerStyle: { backgroundColor: theme.colors.background } }}>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="landing" options={{ headerShown: false }} />
				<Stack.Screen name="login" options={{ presentation: "modal", headerTitle: "Login" }} />
				<Stack.Screen name="register" options={{ presentation: "modal", headerTitle: "Register" }} />
			</Stack>
		</PaperProvider>
	);
}
