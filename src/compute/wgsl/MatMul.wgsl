@group(0) @binding(0) var<storage, read> firstMatrix : array<f32>;
@group(0) @binding(1) var<storage, read> secondMatrix : array<f32>;
@group(0) @binding(2) var<storage, read_write> resultMatrix : array<f32>;
@group(0) @binding(3) var<uniform> uniforms : vec2<u32>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let size = uniforms.x;
    let resultCell = vec2<u32>(global_id.x, global_id.y);
    
    if (resultCell.x >= size || resultCell.y >= size) {
        return;
    }
    
    var result : f32 = 0.0;
    for (var i = 0u; i < size; i = i + 1u) {
        let a = firstMatrix[resultCell.y * size + i];
        let b = secondMatrix[i * size + resultCell.x];
        result = result + a * b;
    }
    
    let index = resultCell.y * size + resultCell.x;
    resultMatrix[index] = result;
}
