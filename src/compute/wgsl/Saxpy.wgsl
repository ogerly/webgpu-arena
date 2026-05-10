@group(0) @binding(0) var<storage, read> x : array<f32>;
@group(0) @binding(1) var<storage, read> y : array<f32>;
@group(0) @binding(2) var<storage, read_write> out : array<f32>;
@group(0) @binding(3) var<uniform> a : f32;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let i = global_id.x;
    let size = arrayLength(&x);
    if (i < size) {
        out[i] = a * x[i] + y[i];
    }
}
