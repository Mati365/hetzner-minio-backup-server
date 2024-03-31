#!/bin/bash

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
STREAM="stable"
VM_NAME="fcos-test-01"
VCPUS="2"
RAM_MB="2048"
STREAM="stable"
DISK_GB="10"

cd $SCRIPT_DIR
export $(grep -v '^#' .env | xargs)

mkdir -p $SCRIPT_DIR/tmp/{config,image}
rm -rf ./tmp/config/*

if ! [ "$(ls -A $SCRIPT_DIR/tmp/image/*.qcow2)" ]; then
  coreos-installer download -s "$STREAM" -p qemu -f qcow2.xz --decompress -C $SCRIPT_DIR/tmp/image
fi

IMAGE_FILE=$(ls $SCRIPT_DIR/tmp/image/*.qcow2 -t | head -n 1)
IGNITION_COMPILED_CONFIG="$SCRIPT_DIR/tmp/config/config.ign"
IGNITION_DEVICE_ARG=(--qemu-commandline="-fw_cfg name=opt/com.coreos/config,file=${IGNITION_COMPILED_CONFIG}")

butane \
  --pretty \
  --strict \
  --files-dir $SCRIPT_DIR/tmp/config \
  --output $IGNITION_COMPILED_CONFIG \
  $SCRIPT_DIR/config.bu

chcon --type svirt_home_t $IGNITION_COMPILED_CONFIG

echo "Prune old VMS.."

sudo virsh destroy $VM_NAME || true
sudo virsh undefine $VM_NAME --remove-all-storage || true

virt-install \
  --connect="qemu:///system" \
  --name="$VM_NAME" \
  --vcpus="$VCPUS" \
  --memory="$RAM_MB" \
  --os-variant="fedora-coreos-$STREAM" \
  --import \
  --graphics=none \
  --noautoconsole \
  --accelerate \
  --disk="size=$DISK_GB,backing_store=$IMAGE_FILE" \
  --network bridge=virbr0 \
  "${IGNITION_DEVICE_ARG[@]}"

VM_MAC=`sudo virsh domiflist $VM_NAME | awk '$2=="bridge"{print $NF}'`

echo "Obtaining VM IP..."

while true;
do
  VM_IP=`sudo arp -na | awk -v mac=$VM_MAC '$0 ~ " at " mac {gsub("[()]", "", $2); print $2}'`

  if ! [ -z "$VM_IP" ] ; then
    echo "VM IP: $VM_IP"
    break
  fi

  sleep 1
done
