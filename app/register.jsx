// IMPORTANT: ChatGPT used to create comments

// Imports necessary components, hooks, and utilities
import { View, useWindowDimensions } from "react-native";
import { useTheme, Button, TextInput } from "react-native-paper";
import { getAuth, createUserWithEmailAndPassword, deleteUser, signOut } from "firebase/auth";
import { useState, useContext } from "react";
import { useRouter } from "expo-router";
import { StateContext } from "../context/stateContext";
import { Spinner } from "../components/spinner";
import { createDiaryFile } from "../utilities/diaryManager";

// Defines the main functional component for user registration
export default function Register() {
	// Hooks for using the theme, router, and state context
	const theme = useTheme();
	const router = useRouter();
	const [email, setEmail] = useState(""); // State for managing email input
	const [password, setPassword] = useState(""); // State for managing password input
	const { width } = useWindowDimensions(); // Gets window dimensions for responsive design
	const { isLoading, setIsLoading } = useContext(StateContext); // Context for managing loading state

	// Function to handle user registration
	const handleRegister = () => {
		setIsLoading(true); // Sets loading state to true during registration process
		createUserWithEmailAndPassword(getAuth(), email, password)
			.then(async (userCredential) => {
				const user = userCredential.user; // Gets user data from user credential
				try {
					await createDiaryFile(user.uid); // Attempts to create a diary file for the user
					console.log(`Registration successful for ${user.uid} and diary created and saved.`);
					signOut(getAuth());
					router.navigate("/landing"); // Navigates to login page on successful registration
				} catch (error) {
					console.error("Could not create diary file:", error);
					// Deletes the user if the diary file cannot be created
					deleteUser(user)
						.then(() => {
							alert("Failed to create your diary. Please allow the app to access your files and try again.");
							console.log("User deleted successfully because the diary could not be created.");
						})
						.catch((delErr) => {
							console.error("Failed to delete the user after diary creation failed:", delErr);
						});
				}
				setIsLoading(false); // Sets loading state to false once the registration process is complete
			})
			.catch((err) => {
				console.error("Registration failed:", err);
				alert(err?.message); // Shows error message if registration fails
				setIsLoading(false); // Sets loading state to false on failure
			});
	};

	// Renders the registration form
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.colors.background,
				paddingHorizontal: width / 10,
				gap: 12,
			}}>
			<View style={{ minWidth: "100%", gap: 6 }}>
				<TextInput
					autoCapitalize="none"
					label="Email"
					keyboardType="email-address"
					onChangeText={(text) => setEmail(text)} // Updates email state on text change
					disabled={isLoading} // Disables input while loading
				/>
				<TextInput
					autoCapitalize="none"
					label="Password"
					secureTextEntry={true}
					onChangeText={(text) => setPassword(text)} // Updates password state on text change
					disabled={isLoading} // Disables input while loading
				/>
			</View>

			<Button style={{ width: 125 }} mode="contained" onPress={handleRegister} disabled={isLoading}>
				{isLoading ? <Spinner theme={theme} /> : "Register"}
			</Button>
		</View>
	);
}
