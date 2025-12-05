import axios from 'axios';

const DROPBOX_API_URL = 'https://api.dropboxapi.com/2';
const DROPBOX_CONTENT_URL = 'https://content.dropboxapi.com/2';

class DropboxService {
  getToken() {
    return localStorage.getItem('dropbox_token');
  }

  isConnected() {
    return !!this.getToken();
  }

  disconnect() {
    localStorage.removeItem('dropbox_token');
  }

  async listFiles(path = '') {
    const token = this.getToken();
    if (!token) throw new Error('Dropbox não conectado');

    try {
      const response = await axios.post(
        `${DROPBOX_API_URL}/files/list_folder`,
        { path, recursive: false },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.entries;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }

  async uploadFile(file, path) {
    const token = this.getToken();
    if (!token) throw new Error('Dropbox não conectado');

    try {
      const response = await axios.post(
        `${DROPBOX_CONTENT_URL}/files/upload`,
        file,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': JSON.stringify({
              path: path,
              mode: 'add',
              autorename: true,
              mute: false
            })
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  async downloadFile(path) {
    const token = this.getToken();
    if (!token) throw new Error('Dropbox não conectado');

    try {
      const response = await axios.post(
        `${DROPBOX_CONTENT_URL}/files/download`,
        null,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Dropbox-API-Arg': JSON.stringify({ path })
          },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      throw error;
    }
  }

  async getSharedLink(path) {
    const token = this.getToken();
    if (!token) throw new Error('Dropbox não conectado');

    try {
      const response = await axios.post(
        `${DROPBOX_API_URL}/sharing/create_shared_link_with_settings`,
        { path },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.url;
    } catch (error) {
      console.error('Erro ao gerar link:', error);
      throw error;
    }
  }
}

export default new DropboxService();
