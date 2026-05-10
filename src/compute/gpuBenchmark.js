import matmulWgsl from './wgsl/MatMul.wgsl?raw';
import saxpyWgsl from './wgsl/Saxpy.wgsl?raw';

let device = null;

export async function initWebGPU() {
  if (device) return device;
  if (!navigator.gpu) throw new Error("WebGPU wird von diesem Browser nicht unterstützt.");
  
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("Kein WebGPU Adapter gefunden.");
  
  device = await adapter.requestDevice();
  return device;
}

export async function runMatMulGPU(size) {
  await initWebGPU();
  
  const shaderModule = device.createShaderModule({ code: matmulWgsl });
  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module: shaderModule, entryPoint: 'main' }
  });

  const matrixSize = size * size * 4; // float32 = 4 bytes
  const uniformData = new Uint32Array([size, size]);
  
  // Create Buffers
  const gpuBufferFirstMatrix = device.createBuffer({
    size: matrixSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });
  const gpuBufferSecondMatrix = device.createBuffer({
    size: matrixSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });
  const gpuBufferResultMatrix = device.createBuffer({
    size: matrixSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });
  const gpuBufferUniform = device.createBuffer({
    size: 8, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });

  // Write uniform configuration
  device.queue.writeBuffer(gpuBufferUniform, 0, uniformData);

  // Fill buffers with dummy 1.0 data for benchmark
  const data = new Float32Array(size * size).fill(1.0);
  device.queue.writeBuffer(gpuBufferFirstMatrix, 0, data);
  device.queue.writeBuffer(gpuBufferSecondMatrix, 0, data);

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: gpuBufferFirstMatrix } },
      { binding: 1, resource: { buffer: gpuBufferSecondMatrix } },
      { binding: 2, resource: { buffer: gpuBufferResultMatrix } },
      { binding: 3, resource: { buffer: gpuBufferUniform } }
    ]
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  
  const workgroupCountX = Math.ceil(size / 8);
  const workgroupCountY = Math.ceil(size / 8);
  passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
  passEncoder.end();

  // Benchmark starts here
  const start = performance.now();
  device.queue.submit([commandEncoder.finish()]);
  await device.queue.onSubmittedWorkDone();
  const timeMs = performance.now() - start;

  // Cleanup
  gpuBufferFirstMatrix.destroy();
  gpuBufferSecondMatrix.destroy();
  gpuBufferResultMatrix.destroy();
  gpuBufferUniform.destroy();

  return timeMs;
}
