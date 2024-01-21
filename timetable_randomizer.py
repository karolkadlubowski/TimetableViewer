import pandas as pd
import numpy as np
import os

# Read the original CSV file
df = pd.read_csv('data/HorarioDeExemplo.csv', sep=';')

# Extract unique values from each column, excluding empty values
classes = df['Class group'].dropna().unique()
registered = df['Enrolled in the shift'].dropna().unique()
days_of_week = df['Day of the week'].dropna().unique()
start_times = sorted(df['Start'].dropna().unique())
end_times = sorted(df['End'].dropna().unique())
days = df['Day'].dropna().unique()
characteristics = df['Characteristics of the room requested for the class'].dropna(
).unique()
classrooms = df['Classroom'].dropna().unique()
occupancies = df['Capacity'].dropna().unique()
actual_characteristics = df['Classroom characteristics'].dropna(
).unique()

# Create a directory to save the randomized CSV files
os.makedirs('data/randomized_timetables', exist_ok=True)

def generate_times(start_times, end_times):
    start = np.random.choice(start_times)
    valid_end_times = [time for time in end_times if time > start]
    end = np.random.choice(valid_end_times) if valid_end_times else start
    return start, end


# Generate randomized timetables
for i in range(10):  # Change this to the number of timetables you want to generate
    df_random = df.copy()
    
    # Randomize only the selected rows for each column
    sample_rows = df_random.sample(frac=np.random.uniform(0, 1))
    sample_rows['Class group'] = np.random.choice(classes, size=len(sample_rows))
    df_random.loc[sample_rows.index, 'Class group'] = sample_rows['Class group']

    sample_rows = df_random.sample(frac=np.random.uniform(0, 1))
    sample_rows['Enrolled in the shift'] = np.random.choice(registered, size=len(sample_rows))
    df_random.loc[sample_rows.index, 'Enrolled in the shift'] = sample_rows['Enrolled in the shift']

    sample_rows = df_random.sample(frac=np.random.uniform(0, 1))
    sample_rows['Day of the week'] = np.random.choice(days_of_week, size=len(sample_rows))
    df_random.loc[sample_rows.index, 'Day of the week'] = sample_rows['Day of the week']

    sample_rows = df_random.sample(frac=np.random.uniform(0, 1))
    sample_rows['Start'], sample_rows['End'] = zip(*[generate_times(start_times, end_times) for _ in range(len(sample_rows))])
    df_random.loc[sample_rows.index, ['Start', 'End']] = sample_rows[['Start', 'End']]

    sample_rows = df_random.sample(frac=np.random.uniform(0, 1))
    sample_rows['Day'] = np.random.choice(days, size=len(sample_rows))
    df_random.loc[sample_rows.index, 'Day'] = sample_rows['Day']

    sample_rows = df_random.sample(frac=np.random.uniform(0, 1))
    sample_rows['Characteristics of the room requested for the class'] = np.random.choice(characteristics, size=len(sample_rows))
    df_random.loc[sample_rows.index, 'Characteristics of the room requested for the class'] = sample_rows['Characteristics of the room requested for the class']

    sample_rows = df_random.sample(frac=np.random.uniform(0, 1))
    sample_rows['Classroom'] = np.random.choice(classrooms, size=len(sample_rows))
    df_random.loc[sample_rows.index, 'Classroom'] = sample_rows['Classroom']

    sample_rows = df_random.sample(frac=np.random.uniform(0, 1))
    sample_rows['Capacity'] = np.random.choice(occupancies, size=len(sample_rows))
    df_random.loc[sample_rows.index, 'Capacity'] = sample_rows['Capacity']

    sample_rows = df_random.sample(frac=np.random.uniform(0, 1))
    sample_rows['Classroom characteristics'] = np.random.choice(actual_characteristics, size=len(sample_rows))
    df_random.loc[sample_rows.index, 'Classroom characteristics'] = sample_rows['Classroom characteristics']

    # Save the randomized timetable to a CSV file
    df_random.to_csv(f'data/randomized_timetables/timetable_{i}.csv', sep=';', index=False)