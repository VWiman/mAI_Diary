import { Keyboard, Pressable } from "react-native";

const DismissKeyboard = ({ children }) => (
	<Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss} accessible={false}>
		{children}
	</Pressable>
);

export default DismissKeyboard
