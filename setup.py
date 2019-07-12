'''
'''
import os
import pickle
import subprocess

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/drive.file']
TOKEN_FILE = '.token.pickle'

BUILD_DIR = 'build'
DEV_DIR = 'dev'

BASE_FOLDER_NAME = 'Piggybank'
SHEET_FOLDER_NAME = 'Data & Reports'
FORM_FOLDER_NAME = 'Forms'

def auth():
    '''
    '''
    creds = None
    # The token file stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server()
        # Save the credentials for the next run
        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)

    return creds

def init_clasp(service, root_dir, title, folder):
    '''
    service = authorized Google Drive API Resource
    dir = <string>
    title = <string>
    doctype = <DocType>
    '''
    base_dir = os.getcwd()

    file_metadata = {'name': title,
                     'mimeType': folder['mime']}
    file_id = service.files().create(body=file_metadata,
                                     fields='id').execute().get('id')

    os.chdir(base_dir + '/' + BUILD_DIR + '/' + root_dir)

    res = subprocess.run('clasp create --title "' + title + ' Script"' +
                         ' --parentId "' + file_id + '"',
                         shell=True, capture_output=True, text=True).stdout
    start_pos = res.find('script.google.com/d/')
    script_id = res[start_pos + 20:res.rfind('/edit\n', start_pos)]

    id_file = open(base_dir + '/' + DEV_DIR + '/' + root_dir + '/id.ts', "w")
    id_file.write("export const ID = '" + file_id + "';")
    id_file.close()

    return {title: file_id, title + ' Script': script_id}

def main():
    '''
    '''
    #pylint: disable=E1101
    creds = auth()
    drive_service = build('drive', 'v3', credentials=creds)

    sheet_folder = {'name': SHEET_FOLDER_NAME,
                    'id':'',
                    'mime': 'application/vnd.google-apps.spreadsheet'}
    form_folder = {'name': FORM_FOLDER_NAME,
                   'id': '',
                   'mime': 'application/vnd.google-apps.spreadsheet'}

    # Folders
    file_metadata = {'name': sheet_folder['name'],
                     'mimeType': 'application/vnd.google-apps.folder'}
    sheet_folder['id'] = drive_service.files() \
                                      .create(body=file_metadata, fields='id') \
                                      .execute()

    file_metadata = {'name': form_folder['name'],
                     'mimeType': 'application/vnd.google-apps.folder'}
    form_folder['id'] = drive_service.files() \
                                     .create(body=file_metadata, fields='id') \
                                     .execute()

    # Sheets
    init_clasp(drive_service, 'database/tables', 'Database', sheet_folder)
    init_clasp(drive_service, 'database/views', 'Generated Report', sheet_folder)

    # Forms
    init_clasp(drive_service, 'forms/collect_dues', 'Collect Dues', form_folder)
    init_clasp(drive_service, 'forms/confirm_transfer', 'Confirm Transfer', form_folder)
    init_clasp(drive_service, 'forms/next_quarter', 'Next Quarter', form_folder)
    init_clasp(drive_service, 'forms/take_attendance', 'Take Attendance', form_folder)
    init_clasp(drive_service, 'forms/transfer_funds', 'Transfer Funds', form_folder)

if __name__ == '__main__':
    main()
