import { readFile } from 'node:fs/promises';
import { createTunnel } from 'tunnel-ssh';
import portfinder from 'portfinder';

import { createLogger } from 'logger';

import type { ReaderTask } from 'fp-ts/ReaderTask';
import type { BackupHostT } from 'policy';

type HostTunnelCreatorAttrs = {
  host: BackupHostT;
  dest: {
    address?: string;
    port: number;
  };
};

export type HostTunnelTaskAttrs = {
  local: { port: number; host: string };
};

export const execInSshTunnel =
  ({ host, dest }: HostTunnelCreatorAttrs) =>
  <R>(task: ReaderTask<HostTunnelTaskAttrs, R>) => {
    const logger = createLogger('ssh-tunnel');

    return async (): Promise<R> => {
      logger.info('Trying to establish SSH tunnel!');

      const auth = {
        ...host.auth,
        ...('privateKey' in host.auth && {
          privateKey: await readFile(host.auth.privateKey, 'utf-8'),
        }),
      };

      const local = {
        host: '127.0.0.1',
        port: await portfinder.getPortPromise(),
      };

      const [server, connection] = await createTunnel(
        {
          autoClose: true,
        },
        {
          port: local.port,
        },
        {
          host: auth.address,
          ...auth,
        },
        {
          dstAddr: dest.address ?? '127.0.0.1',
          dstPort: dest.port,
        },
      );

      const tunnelLogPrefix = `${auth.username}@${auth.address}:${auth.port}:${dest.port}`;
      const closeConnection = async () =>
        await new Promise(resolve => {
          logger.info(`Closing SSH tunnel: ${tunnelLogPrefix}!`);
          server.close(resolve);
        });

      try {
        return await new Promise((resolve, reject) => {
          connection.on('error', reject);
          server.on('error', reject);

          const executor = task({
            local,
          });

          logger.info(`Established SSH tunnel: ${tunnelLogPrefix} -> :${local.port}!`);

          try {
            executor().then(resolve).catch(reject);
          } catch (e) {
            reject(e);
          }
        });
      } finally {
        await closeConnection();
      }
    };
  };
