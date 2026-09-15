import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'guardia.token';
const STUDENT_NAME_KEY = 'guardia.studentName';

export const Prefs = {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  async getStudentName(): Promise<string | null> {
    return AsyncStorage.getItem(STUDENT_NAME_KEY);
  },
  async save(token: string, studentName: string): Promise<void> {
    await AsyncStorage.setMany({ [TOKEN_KEY]: token, [STUDENT_NAME_KEY]: studentName });
  },
  async clear(): Promise<void> {
    await AsyncStorage.removeMany([TOKEN_KEY, STUDENT_NAME_KEY]);
  },
};
