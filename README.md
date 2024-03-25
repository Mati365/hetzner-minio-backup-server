# hetzner-minio-backup-server

Rock solid all-in-one centralised backup server hosted at Hetzner using Ansible as IaC with tools such as MinIO, NGINX, Podman Quadlet.

## Infra environment variables

```bash
HCLOUD_KEY=<hetzner api key with read & write permissions> 
BACKUP_WEBSITE_DOMAIN=<addres of your site like: example.org>
BACKUP_MINIO_USERNAME=<minio dashboard user name>
BACKUP_MINIO_PASSWORD=<minio dashboard user password>
```

## Job policy

Job policy file that describes all jobs that should be performed on specified hosts. It uses ssh tunneling configured in `auth` section to connect to host. Example YML (or JSON) file structure:

```yml
---
hosts:
  - auth:
      address: 192.168.1.133
      username: your-remote-user
      privateKey: /home/your-local-user/.ssh/id_rsa
    jobs:
      test-db-job:
        kind: pg-dump
        cron:
          expression: 0 0 0 * * *
        retention:
          maxBackups: 7
        minio:
          bucket: backup
          key: local-db-backup/dump-%{timestamp}.tar.gz
        database:
          name: test_db
          auth:
            username: postgres
            password: 123456

      test-db-all-job:
        kind: pg-dump-all
        cron:
          expression: 0 0 0 * * *
        retention:
          maxBackups: 7
        minio:
          bucket: backup
          key: local-db-all-backup/dump-all-%{timestamp}.tar.gz
        database:
          auth:
            username: postgres
            password: 123456

      test-rsync-job:
        kind: copy
        exclude:
          - node_modules/cat
        cron:
          expression: 0 0 0 * * *
        retention:
          maxBackups: 7
        minio:
          bucket: backup
          key: local-files-backup/dump-%{timestamp}.tar.gz
        fileOrDir: /home/your-remote-user/backup/
```
